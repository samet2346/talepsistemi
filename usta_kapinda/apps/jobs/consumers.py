import json
import asyncio
import logging
import aioredis  # Async Redis Driver
from django.conf import settings
from django.utils import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.cache import cache

from .models import Job, JobOffer
from .services import JobService

logger = logging.getLogger("websocket_audit")

# 🔋 GLOBAL REDIS POOL (settings.py içinde tanımlanmış varsayıyoruz)
# redis_pool = aioredis.ConnectionPool.from_url("redis://localhost", max_connections=100)

class JobConsumer(AsyncWebsocketConsumer):
    """
    🏆 THE FINAL ARCHITECTURAL CONSUMER
    Features: Connection Pooling, Rate Limiting, Error Propagation, and Async State Recovery.
    """
    
    async def connect(self):
        self.user = self.scope["user"]
        self.job_id = self.scope['url_route']['kwargs'].get('job_id')
        
        # 1. AUTH & RATE LIMIT (Connection Level)
        if not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # 2. REDIS POOL CONNECTION
        self.redis = aioredis.Redis(connection_pool=settings.REDIS_POOL)

        # 3. JOB-SPECIFIC RBAC
        if self.job_id:
            if not await self._check_job_permissions(self.user, self.job_id):
                await self.close(code=4003)
                return
            self.job_group = f'job_{self.job_id}'
            await self.channel_layer.group_add(self.job_group, self.channel_name)

        # 4. GLOBAL USER GROUP
        self.user_group = f'user_{self.user.id}'
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        
        await self.accept()
        
        # 5. ONLINE STATE & HEARTBEAT
        await self.redis.set(f"user_online_{self.user.id}", "1", ex=60)
        self.heartbeat_task = asyncio.create_task(self._run_heartbeat())
        
        # 6. RECOVERY
        await self._deliver_offline_messages()

    async def disconnect(self, close_code):
        if hasattr(self, 'heartbeat_task'):
            self.heartbeat_task.cancel()
        
        await self.redis.delete(f"user_online_{self.user.id}")
        
        if hasattr(self, 'job_group'):
            await self.channel_layer.group_discard(self.job_group, self.channel_name)
        await self.channel_layer.group_discard(self.user_group, self.channel_name)

    async def receive(self, text_data):
        """
        📩 CLIENT ACTION HANDLER (With Rate Limiting & Error Handling)
        """
        # 🛡️ Message Rate Limit (Sliding Window per Connection)
        if not await self._check_message_rate_limit():
            await self._send_error("TOO_MANY_REQUESTS", "Saniyede çok fazla mesaj gönderiyorsunuz.")
            return

        try:
            data = json.loads(text_data)
            action = data.get('type')

            if action == 'PING':
                await self.send(text_data=json.dumps({'type': 'PONG', 'ts': str(timezone.now())}))
                return

            if action == 'SEND_OFFER':
                await self._process_offer(data)

        except json.JSONDecodeError:
            await self._send_error("INVALID_JSON", "Mesaj formatı hatalı.")
        except Exception as e:
            logger.exception(f"WS_RECEIVE_CRITICAL: {e}")
            await self._send_error("INTERNAL_ERROR", "Sunucu tarafında bir hata oluştu.")

    async def _process_offer(self, data):
        """Teklif verme akışını yönetir (Saga & Validation Aware)."""
        try:
            # Service katmanını çağır
            offer_data = await self._handle_offer_creation(data)
            
            if offer_data:
                # Odaya (müşteriye) canlı bildirimi bas
                await self.channel_layer.group_send(
                    self.job_group,
                    {'type': 'offer_received', 'data': offer_data}
                )
                # Ustaya onay mesajı
                await self.send(text_data=json.dumps({'type': 'OFFER_SUCCESS', 'offer_id': offer_data['id']}))
            else:
                await self._send_error("OFFER_FAILED", "Teklif kriterleri karşılanamadı.")

        except Exception as e:
            await self._send_error("OFFER_ERROR", str(e))

    # --- HELPERS (The Missing Parts) ---

    @database_sync_to_async
    def _check_job_permissions(self, user, job_id):
        try:
            job = Job.objects.get(id=job_id)
            return job.owner_id == user.id or \
                   (job.assigned_master and job.assigned_master.user_id == user.id) or \
                   JobOffer.objects.filter(job_id=job_id, master__user_id=user.id).exists()
        except Job.DoesNotExist:
            return False

    @database_sync_to_async
    def _handle_offer_creation(self, data):
        # JobService daha önce yazdığımız o devasa fabrika katmanı
        return JobService.create_offer(
            job_id=self.job_id,
            master_user=self.user,
            price=data['price'],
            message=data.get('message', '')
        )

    async def _deliver_offline_messages(self):
        key = f"offline_msgs_{self.user.id}"
        msgs = await self.redis.get(key)
        if msgs:
            for m in json.loads(msgs):
                await self.send(text_data=json.dumps(m))
            await self.redis.delete(key)

    async def _check_message_rate_limit(self):
        # Saniyede max 5 WebSocket mesajı
        key = f"ws_limit_{self.user.id}"
        count = await self.redis.incr(key)
        if count == 1:
            await self.redis.expire(key, 1)
        return count <= 5

    async def _send_error(self, code, message):
        await self.send(text_data=json.dumps({
            'type': 'ERROR',
            'code': code,
            'message': message
        }))

    async def _run_heartbeat(self):
        while True:
            try:
                await asyncio.sleep(30)
                await self.send(text_data=json.dumps({'type': 'HEARTBEAT'}))
                await self.redis.expire(f"user_online_{self.user.id}", 60)
            except asyncio.CancelledError:
                break
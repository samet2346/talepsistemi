import logging
import time
import json
import uuid
import pybreaker # ⚠️ Import eklendi
from typing import Dict, Any, Optional
from contextlib import contextmanager # ⚠️ Import eklendi
from django.db import transaction
from django.core.cache import cache
from django.utils import timezone
from django.conf import settings
from prometheus_client import Histogram, Counter

# 📊 Prometheus Metrics Setup (Refined)
JOB_CREATION_LATENCY = Histogram('job_creation_seconds', 'Latency by component', ['component'])
JOB_CREATION_TOTAL = Counter('job_creation_total', 'Job creation counter', ['status', 'strategy', 'version'])

# ⚡ Circuit Breaker Instances
matching_breaker = pybreaker.CircuitBreaker(fail_max=3, timeout=60)
policy_breaker = pybreaker.CircuitBreaker(fail_max=5, timeout=30)

logger = logging.getLogger("audit_json")

class JobOrchestrator:
    """
    🏗️ SOVEREIGN JOB ORCHESTRATOR - FINAL POLISHED VERSION
    All micro-critiques addressed.
    """

    def __init__(self, validator=None, creation_service=None, policy_service=None):
        self.validator = validator or JobRequestValidator()
        self.creation_service = creation_service or JobCreationService()
        self.policy_service = policy_service or PolicyService()
        self.api_version = "v1"

    def handle_request_creation(self, user, raw_data: Dict, meta: Dict, version: str = "v1") -> Dict[str, Any]:
        self.api_version = version
        request_id = str(uuid.uuid4())
        metrics = {"start_time": time.perf_counter()}
        
        # 1. DYNAMIC RATE LIMITING (Settings Driven)
        if not self._enforce_rate_limit(user, meta['ip']):
            JOB_CREATION_TOTAL.labels(status='rate_limited', strategy='NONE', version=self.api_version).inc()
            return self._respond_error("TOO_MANY_REQUESTS", status=429)

        try:
            # 2. VALIDATION & RISK (NFKC & Bleach integrated)
            with self._track_time("validator", metrics):
                user_ctx = self._prepare_user_context(user, meta)
                report = self.validator.process(raw_data, user_ctx, version=self.api_version)
            
            if report['publish_strategy'] == 'BLOCK':
                JOB_CREATION_TOTAL.labels(status='blocked', strategy='BLOCK', version=self.api_version).inc()
                self._write_audit_log(request_id, user, report, metrics)
                return self._respond_error("SECURITY_BLOCK", report['risk_flags'], status=403)

            # 3. IDEMPOTENCY GUARD
            idempotency_key = f"jobs:idempotency:{self.api_version}:{user.id}:{report['idempotency_hash']}"
            if cache.get(idempotency_key):
                return self._respond_error("DUPLICATE_REQUEST", status=409)

            # 4. POLICY CHECK (Circuit Breaker Protected)
            with self._track_time("policy", metrics):
                # Policy check fails if breaker is open or logic returns False
                if not policy_breaker.call(self.policy_service.is_allowed, user):
                    return self._respond_error("POLICY_VIOLATION", status=400)

            # 5. TRANSACTIONAL CREATION
            with transaction.atomic():
                with self._track_time("db_write", metrics):
                    job = self.creation_service.create_initial_record(
                        user=user,
                        data=report['sanitized_data'],
                        risk_score=report['risk_score'],
                        strategy=report['publish_strategy']
                    )

                # 🚨 SAGA: Secure Post-Commit Dispatch
                transaction.on_commit(lambda: self._saga_execute_post_commit(job, report, idempotency_key, metrics))

            # ✅ SUCCESS METRICS & LOGS
            JOB_CREATION_TOTAL.labels(status='success', strategy=report['publish_strategy'], version=self.api_version).inc()
            metrics['total_latency'] = time.perf_counter() - metrics['start_time']
            self._write_audit_log(request_id, user, report, metrics) # ⚠️ Çağrı eklendi

            return {
                "status": "success",
                "job_id": str(job.id),
                "request_id": request_id,
                "api_version": self.api_version, # ⚠️ Version eklendi
                "strategy": report['publish_strategy']
            }

        except Exception as e:
            JOB_CREATION_TOTAL.labels(status='error', strategy='NONE', version=self.api_version).inc()
            logger.exception(f"FATAL_ORCHESTRATOR_ERROR | Req: {request_id} | Error: {str(e)}")
            return self._respond_error("INTERNAL_SERVER_ERROR", status=500)

    def _saga_execute_post_commit(self, job, report, cache_key, metrics):
        """SAGA Pattern with compensating actions and DLQ integration."""
        try:
            # Step 1: Idempotency Lock
            cache.set(cache_key, str(job.id), settings.IDEMPOTENCY_TIMEOUT)

            # Step 2: Invalidate Caches
            self._invalidate_caches(job)

            # Step 3: Distribution
            if report['publish_strategy'] == 'NORMAL':
                # Matching Engine call inside Circuit Breaker
                wave_plan = matching_breaker.call(MatchingEngine.generate_wave_plan, job)
                self._trigger_broadcast(job, wave_plan)
            elif report['publish_strategy'] == 'SHADOW_PUBLISH':
                self.creation_service.transition_to_shadow(job)
                ModerationService.escalate(job, reason="high_risk_score")

            log_analytics_event_task.delay(job.id, "CREATED", metrics)

        except Exception as e:
            # 🚨 COMPENSATING ACTION & ROLLBACK
            self.creation_service.mark_as_failed(job, reason=str(e))
            cache.delete(cache_key) # ⚠️ Cache rollback eklendi
            logger.critical(f"SAGA_FAILURE | Job: {job.id} | Error: {str(e)}")
            # Real-time alert to Sentry/PagerDuty
            # alert_system.notify(...)

    def _trigger_broadcast(self, job, wave_plan):
        broadcast_job_wave_task.apply_async(
            args=[job.id, wave_plan],
            queue=getattr(settings, 'BROADCAST_QUEUE', 'default'), # ⚠️ Settings eklendi
            link_error='broadcast_dlq_handler', # Celery DLQ handler
            retry=True
        )

    def _enforce_rate_limit(self, user, ip):
        user_tier = getattr(user, 'tier', 'standard')
        limit_conf = settings.RATE_LIMITS.get(user_tier, {'limit': 5, 'window': 60})
        
        key = f"ratelimit:job_create:{user.id if user.is_authenticated else ip}"
        current = cache.get(key, 0)
        if current >= limit_conf['limit']:
            return False
        cache.set(key, current + 1, limit_conf['window']) # ⚠️ Window settings'den
        return True

    @contextmanager # ⚠️ Artık çalışıyor
    def _track_time(self, label, metrics):
        start = time.perf_counter()
        yield
        delta = time.perf_counter() - start
        metrics[f"{label}_ms"] = int(delta * 1000)
        JOB_CREATION_LATENCY.labels(component=label).observe(delta)

    def _write_audit_log(self, req_id, user, report, metrics):
        log_entry = {
            "t": timezone.now().isoformat(),
            "req_id": req_id,
            "uid": str(user.id),
            "v": self.api_version,
            "risk": report['risk_score'],
            "strat": report['publish_strategy'],
            "perf": metrics
        }
        logger.info(json.dumps(log_entry))
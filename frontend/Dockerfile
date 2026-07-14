# 1. Aşama: Bağımlılıkları yükle ve Build al
FROM node:20-alpine AS builder
WORKDIR /app

# Sadece package dosyalarını kopyala (önbellek kullanımı için)
COPY package*.json ./
RUN npm install

# Projenin tamamını kopyala ve build al
COPY . .
RUN npm run build

# 2. Aşama: Sadece gerekli dosyalarla uygulamayı çalıştır
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Sadece production için gerekli olan dosyaları kopyala
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
# 1. Aşama: Bağımlılıkları yükle ve Build al
FROM node:20-alpine AS builder
WORKDIR /app

# Build sırasında kullanılacak env değişkenini tanımla
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

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

# Runtime'da da aynı değişkeni geçir (bazı Next.js kullanım şekillerinde gerekebilir)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Sadece production için gerekli olan dosyaları kopyala
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
ARG BUILD_DATE
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN mkdir -p uploads/profile-images uploads/resumes uploads/payslips logs && chown -R appuser:nodejs uploads logs
USER appuser
EXPOSE 5000
ENV NODE_ENV=production \
    PORT=10000
CMD ["node", "server.js"]

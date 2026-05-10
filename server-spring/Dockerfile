# ═══════════════════════════════════════════════════════════
# Multi-stage Dockerfile for Smart Workplace OS Backend
# Stage 1: Build the JAR with Maven
# Stage 2: Run the JAR on a slim JRE image
# ═══════════════════════════════════════════════════════════

FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
# Download dependencies first (cached if pom.xml hasn't changed)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY src src
RUN ./mvnw clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create upload directory
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

COPY --from=builder /app/target/*.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]

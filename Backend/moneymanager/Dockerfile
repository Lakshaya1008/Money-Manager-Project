# ============================================
# Money Manager - Production Dockerfile
# ============================================

# ---------- Build Stage ----------
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY pom.xml .
COPY mvnw .
COPY .mvn/ .mvn/

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw clean package -DskipTests -B

# Rename JAR to fixed name for easier copying
RUN mv target/moneymanager-*.jar target/app.jar

# ---------- Runtime Stage ----------
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Money Manager Team"
LABEL version="1.0"
LABEL description="Money Manager Backend API"

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy the renamed JAR
COPY --from=builder /app/target/app.jar app.jar

RUN chown -R appuser:appgroup /app
USER appuser

ENV SERVER_PORT=8081
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8081/api/v1.0/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=70.0", \
    "-XX:InitialRAMPercentage=30.0", \
    "-XX:+UseG1GC", \
    "-XX:+UseStringDeduplication", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]

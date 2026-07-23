# ── Stage 1: Build ────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files first (layer-cache optimization)
COPY FoodDelivery.sln                                              ./
COPY FoodDelivery.Domain/FoodDelivery.Domain.csproj               FoodDelivery.Domain/
COPY FoodDelivery.Application/FoodDelivery.Application.csproj     FoodDelivery.Application/
COPY FoodDelivery.Infrastructure/FoodDelivery.Infrastructure.csproj FoodDelivery.Infrastructure/
COPY FoodDelivery.API/FoodDelivery.API.csproj                     FoodDelivery.API/
COPY FoodDelivery.Tests/FoodDelivery.Tests.csproj                 FoodDelivery.Tests/

# Restore packages (cached unless .csproj files change)
RUN dotnet restore FoodDelivery.API/FoodDelivery.API.csproj

# Copy all source code
COPY . .

# Publish release build
RUN dotnet publish FoodDelivery.API/FoodDelivery.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ── Stage 2: Runtime ───────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Security: run as non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy published output
COPY --from=build /app/publish .

# Create upload directory with correct permissions
RUN mkdir -p wwwroot/uploads && \
    chown -R appuser:appgroup wwwroot/uploads && \
    chmod 755 wwwroot/uploads

# Create logs directory
RUN mkdir -p logs && chown -R appuser:appgroup logs

USER appuser

EXPOSE 8080

# Health check — Docker will restart unhealthy containers
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "FoodDelivery.API.dll"]

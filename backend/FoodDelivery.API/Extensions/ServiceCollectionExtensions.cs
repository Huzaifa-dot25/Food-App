using FoodDelivery.API.Middleware;
using FoodDelivery.Application.Common.Interfaces;
using FoodDelivery.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;

namespace FoodDelivery.API.Extensions;

public static class ServiceCollectionExtensions
{
    // ── JWT Authentication ────────────────────────────────────────────
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration config)
    {
        var jwtSettings = config.GetSection("JwtSettings");
        var secretKey   = jwtSettings["SecretKey"]!;

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer           = true,
                ValidateAudience         = true,
                ValidateLifetime         = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer              = jwtSettings["Issuer"],
                ValidAudience            = jwtSettings["Audience"],
                IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ClockSkew                = TimeSpan.Zero  // No tolerance for expired tokens
            };

            // Allow JWT in SignalR query string
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = ctx =>
                {
                    var accessToken = ctx.Request.Query["access_token"];
                    var path = ctx.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) &&
                        path.StartsWithSegments("/hubs"))
                    {
                        ctx.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        return services;
    }

    // ── Role-Based Authorization Policies ────────────────────────────
    public static IServiceCollection AddRolePolicies(this IServiceCollection services)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy("CustomerOnly", p => p.RequireRole("Customer"))
            .AddPolicy("OwnerOnly",    p => p.RequireRole("Owner"))
            .AddPolicy("RiderOnly",    p => p.RequireRole("Rider"))
            .AddPolicy("AdminOnly",    p => p.RequireRole("Admin"))
            .AddPolicy("OwnerOrAdmin", p => p.RequireRole("Owner", "Admin"));

        return services;
    }

    // ── Swagger with JWT support ──────────────────────────────────────
    public static IServiceCollection AddSwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title       = "Food Delivery API",
                Version     = "v1",
                Description = "Production-quality REST API for a multi-role food delivery platform"
            });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name         = "Authorization",
                Type         = SecuritySchemeType.Http,
                Scheme       = "Bearer",
                BearerFormat = "JWT",
                In           = ParameterLocation.Header,
                Description  = "Enter: Bearer {your JWT token}"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id   = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }

    // ── Rate Limiting ─────────────────────────────────────────────────
    public static IServiceCollection AddRateLimiting(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddRateLimiter(options =>
        {
            // Auth endpoints — strict (5 req/min)
            options.AddFixedWindowLimiter("auth", o =>
            {
                o.PermitLimit      = config.GetValue<int>("RateLimiting:AuthEndpointPermitLimit",   5);
                o.Window           = TimeSpan.FromSeconds(
                    config.GetValue<int>("RateLimiting:AuthEndpointWindowSeconds", 60));
                o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                o.QueueLimit           = 0;
            });

            // Global — generous (100 req/min)
            options.AddFixedWindowLimiter("global", o =>
            {
                o.PermitLimit = config.GetValue<int>("RateLimiting:GlobalPermitLimit",   100);
                o.Window      = TimeSpan.FromSeconds(
                    config.GetValue<int>("RateLimiting:GlobalWindowSeconds", 60));
                o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                o.QueueLimit           = 5;
            });

            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        });

        return services;
    }

    // ── CurrentUserService (HTTP context accessor) ────────────────────
    public static IServiceCollection AddCurrentUserService(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        return services;
    }
}

/// <summary>
/// Reads the authenticated user's claims from the current HTTP context.
/// </summary>
internal class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUserService(IHttpContextAccessor accessor)
        => _accessor = accessor;

    public int UserId =>
        int.Parse(_accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    public string Email =>
        _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

    public IReadOnlyList<string> Roles =>
        _accessor.HttpContext?.User
            .FindAll(ClaimTypes.Role)
            .Select(c => c.Value)
            .ToList() ?? new List<string>();

    public bool IsInRole(string role) =>
        _accessor.HttpContext?.User.IsInRole(role) ?? false;
}

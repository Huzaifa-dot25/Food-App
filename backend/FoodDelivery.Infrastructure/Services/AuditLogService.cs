using FoodDelivery.Domain.Entities;
using FoodDelivery.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace FoodDelivery.Infrastructure.Services;

/// <summary>
/// Writes immutable audit log records for security-sensitive operations
/// (login, password change, user suspend, restaurant approve, etc.)
/// </summary>
public class AuditLogService
{
    private readonly AppDbContext       _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditLogService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context             = context;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task LogAsync(
        string  action,
        string  entityName,
        string  entityId,
        int?    userId      = null,
        object? oldValues   = null,
        object? newValues   = null)
    {
        var log = new AuditLog
        {
            UserId     = userId,
            Action     = action,
            EntityName = entityName,
            EntityId   = entityId,
            OldValues  = oldValues is null
                ? null
                : JsonSerializer.Serialize(oldValues),
            NewValues  = newValues is null
                ? null
                : JsonSerializer.Serialize(newValues),
            IpAddress  = GetClientIp(),
            CreatedAt  = DateTime.UtcNow
        };

        await _context.AuditLogs.AddAsync(log);
        await _context.SaveChangesAsync();
    }

    private string? GetClientIp()
    {
        var ctx = _httpContextAccessor.HttpContext;
        if (ctx is null) return null;

        // Support X-Forwarded-For from reverse proxy
        var forwarded = ctx.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwarded))
            return forwarded.Split(',')[0].Trim();

        return ctx.Connection.RemoteIpAddress?.ToString();
    }

    // ── Common audit actions ──────────────────────────────────────

    public Task LogLoginAsync(int userId, string email)
        => LogAsync("Login", "User", userId.ToString(), userId,
                    newValues: new { email, timestamp = DateTime.UtcNow });

    public Task LogPasswordResetAsync(int userId, string email)
        => LogAsync("PasswordReset", "User", userId.ToString(), userId,
                    newValues: new { email });

    public Task LogUserSuspendedAsync(int adminId, int targetUserId, string reason)
        => LogAsync("Suspend", "User", targetUserId.ToString(), adminId,
                    newValues: new { reason });

    public Task LogRestaurantApprovedAsync(int adminId, int restaurantId)
        => LogAsync("Approve", "Restaurant", restaurantId.ToString(), adminId);

    public Task LogOrderCreatedAsync(int customerId, int orderId, string orderNumber)
        => LogAsync("Create", "Order", orderId.ToString(), customerId,
                    newValues: new { orderNumber });
}

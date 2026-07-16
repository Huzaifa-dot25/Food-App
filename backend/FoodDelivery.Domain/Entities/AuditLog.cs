namespace FoodDelivery.Domain.Entities;

public class AuditLog
{
    public int Id { get; set; }
    public int? UserId { get; set; }            // null for system actions
    public string Action { get; set; } = string.Empty;     // Created, Updated, Deleted
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string? OldValues { get; set; }      // JSON serialized
    public string? NewValues { get; set; }      // JSON serialized
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

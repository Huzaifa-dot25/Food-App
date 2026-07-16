using FoodDelivery.Domain.Enums;

namespace FoodDelivery.Domain.Entities;

public class Notification : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;

    public NotificationType Type { get; set; }

    /// <summary>Optional ID of the related entity (e.g. OrderId).</summary>
    public int? ReferenceId { get; set; }

    public bool IsRead { get; set; } = false;
}

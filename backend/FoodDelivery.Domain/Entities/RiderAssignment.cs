namespace FoodDelivery.Domain.Entities;

public class RiderAssignment : BaseEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int RiderId { get; set; }
    public Rider Rider { get; set; } = null!;

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public DateTime? AcceptedAt { get; set; }
    public DateTime? PickedUpAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    public bool IsAccepted { get; set; } = false;
    public bool IsRejected { get; set; } = false;
}

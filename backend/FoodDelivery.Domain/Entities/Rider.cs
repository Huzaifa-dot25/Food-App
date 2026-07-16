using FoodDelivery.Domain.Enums;

namespace FoodDelivery.Domain.Entities;

public class Rider : BaseEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public VehicleType VehicleType { get; set; }
    public string? VehiclePlate { get; set; }
    public string? LicenseNumber { get; set; }

    // Real-time location (updated by rider app)
    public double? CurrentLatitude { get; set; }
    public double? CurrentLongitude { get; set; }

    public bool IsAvailable { get; set; } = false;
    public RiderStatus Status { get; set; } = RiderStatus.PendingApproval;

    public int TotalDeliveries { get; set; } = 0;
    public decimal TotalEarnings { get; set; } = 0;

    // Navigation
    public ICollection<RiderAssignment> Assignments { get; set; } = new List<RiderAssignment>();
}

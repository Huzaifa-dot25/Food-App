using FoodDelivery.Domain.Entities;

namespace FoodDelivery.Infrastructure.Repositories.Interfaces;

public interface IRiderRepository : IGenericRepository<Rider>
{
    Task<Rider?> GetByUserIdAsync(int userId);
    Task<Rider?> GetWithDetailsAsync(int riderId);
    Task<IReadOnlyList<Rider>> GetAvailableRidersAsync(double lat, double lng, double radiusKm = 10);
    Task<(IReadOnlyList<Rider> Items, int TotalCount)> GetAllAsync(int page, int pageSize, string? status);
}

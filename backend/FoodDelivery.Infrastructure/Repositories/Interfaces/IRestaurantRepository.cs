using FoodDelivery.Application.DTOs.Restaurant;
using FoodDelivery.Domain.Entities;

namespace FoodDelivery.Infrastructure.Repositories.Interfaces;

public interface IRestaurantRepository : IGenericRepository<Restaurant>
{
    Task<Restaurant?> GetWithDetailsAsync(int id);
    Task<Restaurant?> GetByOwnerIdAsync(int ownerId);
    Task<(IReadOnlyList<Restaurant> Items, int TotalCount)> SearchAsync(RestaurantSearchRequest request);
    Task<IReadOnlyList<Restaurant>> GetNearbyAsync(double lat, double lng, double radiusKm);
    Task<IReadOnlyList<Restaurant>> GetFeaturedAsync(int count = 10);
}

using FoodDelivery.Application.DTOs.Food;
using FoodDelivery.Domain.Entities;

namespace FoodDelivery.Infrastructure.Repositories.Interfaces;

public interface IFoodRepository : IGenericRepository<Food>
{
    Task<Food?> GetWithDetailsAsync(int id);
    Task<IReadOnlyList<Food>> GetByRestaurantAsync(int restaurantId, int? categoryId = null);
    Task<(IReadOnlyList<Food> Items, int TotalCount)> SearchAsync(FoodSearchRequest request);
}

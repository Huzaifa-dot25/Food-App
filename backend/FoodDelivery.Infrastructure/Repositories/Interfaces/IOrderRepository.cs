using FoodDelivery.Application.DTOs.Order;
using FoodDelivery.Domain.Entities;

namespace FoodDelivery.Infrastructure.Repositories.Interfaces;

public interface IOrderRepository : IGenericRepository<Order>
{
    Task<Order?> GetWithDetailsAsync(int orderId);
    Task<(IReadOnlyList<Order> Items, int TotalCount)> GetByCustomerAsync(int customerId, OrderFilterRequest filter);
    Task<(IReadOnlyList<Order> Items, int TotalCount)> GetByRestaurantAsync(int restaurantId, OrderFilterRequest filter);
    Task<(IReadOnlyList<Order> Items, int TotalCount)> GetAllAsync(OrderFilterRequest filter);
    Task<string> GenerateOrderNumberAsync();
}

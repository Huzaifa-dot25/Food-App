using FoodDelivery.Domain.Entities;

namespace FoodDelivery.Infrastructure.Repositories.Interfaces;

public interface ICartRepository : IGenericRepository<Cart>
{
    Task<Cart?> GetActiveCartAsync(int customerId);
    Task<Cart?> GetWithItemsAsync(int cartId);
}

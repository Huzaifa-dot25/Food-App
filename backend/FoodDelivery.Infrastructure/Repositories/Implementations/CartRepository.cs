using FoodDelivery.Domain.Entities;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Repositories.Implementations;

public class CartRepository : GenericRepository<Cart>, ICartRepository
{
    public CartRepository(AppDbContext context) : base(context) { }

    public async Task<Cart?> GetActiveCartAsync(int customerId) =>
        await _context.Carts
            .Include(c => c.Items).ThenInclude(i => i.Food).ThenInclude(f => f.Images)
            .Include(c => c.Restaurant)
            .Include(c => c.Coupon)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

    public async Task<Cart?> GetWithItemsAsync(int cartId) =>
        await _context.Carts
            .Include(c => c.Items).ThenInclude(i => i.Food).ThenInclude(f => f.Images)
            .Include(c => c.Restaurant)
            .Include(c => c.Coupon)
            .FirstOrDefaultAsync(c => c.Id == cartId);
}

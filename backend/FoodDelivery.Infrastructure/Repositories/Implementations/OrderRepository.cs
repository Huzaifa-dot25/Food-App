using FoodDelivery.Application.DTOs.Order;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Repositories.Implementations;

public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext context) : base(context) { }

    public async Task<Order?> GetWithDetailsAsync(int orderId) =>
        await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Restaurant)
            .Include(o => o.Address)
            .Include(o => o.Coupon)
            .Include(o => o.Items).ThenInclude(i => i.Food)
            .Include(o => o.Payment)
            .Include(o => o.RiderAssignment).ThenInclude(ra => ra != null ? ra.Rider : null)
                .ThenInclude(r => r != null ? r.User : null)
            .Include(o => o.Review)
            .FirstOrDefaultAsync(o => o.Id == orderId);

    public async Task<(IReadOnlyList<Order> Items, int TotalCount)> GetByCustomerAsync(
        int customerId, OrderFilterRequest filter)
    {
        var query = _context.Orders
            .Include(o => o.Restaurant)
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .Where(o => o.CustomerId == customerId)
            .AsQueryable();

        query = ApplyFilters(query, filter);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<(IReadOnlyList<Order> Items, int TotalCount)> GetByRestaurantAsync(
        int restaurantId, OrderFilterRequest filter)
    {
        var query = _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .Where(o => o.RestaurantId == restaurantId)
            .AsQueryable();

        query = ApplyFilters(query, filter);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<(IReadOnlyList<Order> Items, int TotalCount)> GetAllAsync(OrderFilterRequest filter)
    {
        var query = _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Restaurant)
            .Include(o => o.Items)
            .Include(o => o.Payment)
            .AsQueryable();

        query = ApplyFilters(query, filter);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<string> GenerateOrderNumberAsync()
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var todayCount = await _context.Orders
            .CountAsync(o => o.CreatedAt.Date == DateTime.UtcNow.Date);
        return $"ORD-{datePart}-{(todayCount + 1):D4}";
    }

    private static IQueryable<Order> ApplyFilters(IQueryable<Order> query, OrderFilterRequest filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status) &&
            Enum.TryParse<OrderStatus>(filter.Status, true, out var status))
            query = query.Where(o => o.Status == status);

        if (filter.From.HasValue)
            query = query.Where(o => o.CreatedAt >= filter.From.Value);

        if (filter.To.HasValue)
            query = query.Where(o => o.CreatedAt <= filter.To.Value);

        return query;
    }
}

using FoodDelivery.Application.DTOs.Food;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Repositories.Implementations;

public class FoodRepository : GenericRepository<Food>, IFoodRepository
{
    public FoodRepository(AppDbContext context) : base(context) { }

    public async Task<Food?> GetWithDetailsAsync(int id) =>
        await _context.Foods
            .Include(f => f.Category)
            .Include(f => f.Restaurant)
            .Include(f => f.Images)
            .FirstOrDefaultAsync(f => f.Id == id);

    public async Task<IReadOnlyList<Food>> GetByRestaurantAsync(int restaurantId, int? categoryId = null)
    {
        var query = _context.Foods
            .Include(f => f.Category)
            .Include(f => f.Images)
            .Where(f => f.RestaurantId == restaurantId && f.IsAvailable);

        if (categoryId.HasValue)
            query = query.Where(f => f.CategoryId == categoryId.Value);

        return await query.OrderBy(f => f.Category.SortOrder).ThenBy(f => f.Name).ToListAsync();
    }

    public async Task<(IReadOnlyList<Food> Items, int TotalCount)> SearchAsync(FoodSearchRequest request)
    {
        var query = _context.Foods
            .Include(f => f.Category)
            .Include(f => f.Images)
            .Where(f => f.IsAvailable)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Keyword))
            query = query.Where(f => f.Name.Contains(request.Keyword) ||
                                     f.Description.Contains(request.Keyword));

        if (request.RestaurantId.HasValue)
            query = query.Where(f => f.RestaurantId == request.RestaurantId.Value);

        if (request.CategoryId.HasValue)
            query = query.Where(f => f.CategoryId == request.CategoryId.Value);

        if (request.MinPrice.HasValue)
            query = query.Where(f => f.Price >= request.MinPrice.Value);

        if (request.MaxPrice.HasValue)
            query = query.Where(f => f.Price <= request.MaxPrice.Value);

        if (request.MinRating.HasValue)
            query = query.Where(f => f.AverageRating >= request.MinRating.Value);

        if (request.IsVegetarian.HasValue)
            query = query.Where(f => f.IsVegetarian == request.IsVegetarian.Value);

        if (request.IsBestSeller.HasValue && request.IsBestSeller.Value)
            query = query.Where(f => f.IsBestSeller);

        var total = await query.CountAsync();

        query = request.SortBy?.ToLower() switch
        {
            "price_asc"  => query.OrderBy(f => f.Price),
            "price_desc" => query.OrderByDescending(f => f.Price),
            "rating"     => query.OrderByDescending(f => f.AverageRating),
            _            => query.OrderByDescending(f => f.AverageRating)
        };

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return (items, total);
    }
}

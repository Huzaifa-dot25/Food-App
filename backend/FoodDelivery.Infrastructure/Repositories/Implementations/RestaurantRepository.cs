using FoodDelivery.Application.DTOs.Restaurant;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Repositories.Implementations;

public class RestaurantRepository : GenericRepository<Restaurant>, IRestaurantRepository
{
    public RestaurantRepository(AppDbContext context) : base(context) { }

    public async Task<Restaurant?> GetWithDetailsAsync(int id) =>
        await _context.Restaurants
            .Include(r => r.Owner)
            .Include(r => r.Category)
            .Include(r => r.BusinessHours)
            .Include(r => r.FoodCategories)
            .FirstOrDefaultAsync(r => r.Id == id);

    public async Task<Restaurant?> GetByOwnerIdAsync(int ownerId) =>
        await _context.Restaurants
            .Include(r => r.Category)
            .Include(r => r.BusinessHours)
            .Include(r => r.FoodCategories)
            .FirstOrDefaultAsync(r => r.OwnerId == ownerId);

    public async Task<(IReadOnlyList<Restaurant> Items, int TotalCount)> SearchAsync(RestaurantSearchRequest request)
    {
        var query = _context.Restaurants
            .Include(r => r.Category)
            .Where(r => r.Status == RestaurantStatus.Active)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Keyword))
            query = query.Where(r => r.Name.Contains(request.Keyword) ||
                                     r.Description.Contains(request.Keyword));

        if (request.CategoryId.HasValue)
            query = query.Where(r => r.CategoryId == request.CategoryId.Value);

        if (request.MinRating.HasValue)
            query = query.Where(r => r.AverageRating >= request.MinRating.Value);

        if (request.IsOpen.HasValue)
            query = query.Where(r => r.IsCurrentlyOpen == request.IsOpen.Value);

        var totalCount = await query.CountAsync();

        query = request.SortBy?.ToLower() switch
        {
            "deliveryfee" => query.OrderBy(r => r.DeliveryFee),
            "rating"      => query.OrderByDescending(r => r.AverageRating),
            _             => query.OrderByDescending(r => r.AverageRating)
        };

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<IReadOnlyList<Restaurant>> GetNearbyAsync(double lat, double lng, double radiusKm)
    {
        // Load active restaurants and filter by distance in memory (Haversine)
        // For large datasets use a spatial index or computed column approach
        var restaurants = await _context.Restaurants
            .Include(r => r.Category)
            .Where(r => r.Status == RestaurantStatus.Active)
            .ToListAsync();

        return restaurants
            .Where(r => HaversineKm(lat, lng, r.Latitude, r.Longitude) <= radiusKm)
            .OrderBy(r => HaversineKm(lat, lng, r.Latitude, r.Longitude))
            .ToList();
    }

    public async Task<IReadOnlyList<Restaurant>> GetFeaturedAsync(int count = 10) =>
        await _context.Restaurants
            .Include(r => r.Category)
            .Where(r => r.Status == RestaurantStatus.Active && r.IsCurrentlyOpen)
            .OrderByDescending(r => r.AverageRating)
            .Take(count)
            .ToListAsync();

    private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }
    private static double ToRad(double deg) => deg * Math.PI / 180;
}

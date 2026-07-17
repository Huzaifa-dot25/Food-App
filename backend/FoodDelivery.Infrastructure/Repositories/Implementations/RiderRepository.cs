using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Repositories.Implementations;

public class RiderRepository : GenericRepository<Rider>, IRiderRepository
{
    public RiderRepository(AppDbContext context) : base(context) { }

    public async Task<Rider?> GetByUserIdAsync(int userId) =>
        await _context.Riders
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.UserId == userId);

    public async Task<Rider?> GetWithDetailsAsync(int riderId) =>
        await _context.Riders
            .Include(r => r.User)
            .Include(r => r.Assignments)
            .FirstOrDefaultAsync(r => r.Id == riderId);

    public async Task<IReadOnlyList<Rider>> GetAvailableRidersAsync(double lat, double lng, double radiusKm = 10)
    {
        var riders = await _context.Riders
            .Include(r => r.User)
            .Where(r => r.IsAvailable && r.Status == RiderStatus.Active &&
                        r.CurrentLatitude != null && r.CurrentLongitude != null)
            .ToListAsync();

        return riders
            .Where(r => HaversineKm(lat, lng, r.CurrentLatitude!.Value, r.CurrentLongitude!.Value) <= radiusKm)
            .OrderBy(r => HaversineKm(lat, lng, r.CurrentLatitude!.Value, r.CurrentLongitude!.Value))
            .ToList();
    }

    public async Task<(IReadOnlyList<Rider> Items, int TotalCount)> GetAllAsync(
        int page, int pageSize, string? status)
    {
        var query = _context.Riders.Include(r => r.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<RiderStatus>(status, true, out var riderStatus))
            query = query.Where(r => r.Status == riderStatus);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }
}

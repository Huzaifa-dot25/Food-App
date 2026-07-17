using AutoMapper;
using FoodDelivery.Application.Common.Interfaces;
using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Restaurant;
using FoodDelivery.Application.Services.Interfaces;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Services;

public class RestaurantService : IRestaurantService
{
    private readonly IRestaurantRepository _restaurantRepo;
    private readonly AppDbContext          _context;
    private readonly IGeoService           _geo;
    private readonly IFileStorageService   _fileStorage;
    private readonly IMapper               _mapper;

    public RestaurantService(
        IRestaurantRepository restaurantRepo,
        AppDbContext context,
        IGeoService geo,
        IFileStorageService fileStorage,
        IMapper mapper)
    {
        _restaurantRepo = restaurantRepo;
        _context        = context;
        _geo            = geo;
        _fileStorage    = fileStorage;
        _mapper         = mapper;
    }

    public async Task<PagedResult<RestaurantSummaryDto>> SearchAsync(
        RestaurantSearchRequest request, int? currentUserId = null)
    {
        var (items, total) = await _restaurantRepo.SearchAsync(request);
        var favoriteIds    = await GetFavoriteIdsAsync(currentUserId);

        var dtos = items.Select(r =>
        {
            var dto = _mapper.Map<RestaurantSummaryDto>(r);
            dto.IsFavorite  = favoriteIds.Contains(r.Id);
            dto.DistanceKm  = request.Latitude.HasValue && request.Longitude.HasValue
                ? Math.Round(_geo.CalculateDistanceKm(
                    request.Latitude.Value, request.Longitude.Value,
                    r.Latitude, r.Longitude), 1)
                : null;
            return dto;
        }).ToList();

        return PagedResult<RestaurantSummaryDto>.Create(dtos, total,
            request.PageNumber, request.PageSize);
    }

    public async Task<RestaurantDto> GetByIdAsync(int id, int? currentUserId = null)
    {
        var restaurant = await _restaurantRepo.GetWithDetailsAsync(id)
            ?? throw new NotFoundException("Restaurant", id);

        var dto = _mapper.Map<RestaurantDto>(restaurant);
        return dto;
    }

    public async Task<IReadOnlyList<RestaurantSummaryDto>> GetNearbyAsync(
        double lat, double lng, double radiusKm, int? currentUserId = null)
    {
        var restaurants = await _restaurantRepo.GetNearbyAsync(lat, lng, radiusKm);
        var favoriteIds = await GetFavoriteIdsAsync(currentUserId);

        return restaurants.Select(r =>
        {
            var dto = _mapper.Map<RestaurantSummaryDto>(r);
            dto.DistanceKm = Math.Round(_geo.CalculateDistanceKm(lat, lng, r.Latitude, r.Longitude), 1);
            dto.IsFavorite = favoriteIds.Contains(r.Id);
            return dto;
        }).ToList();
    }

    public async Task<IReadOnlyList<RestaurantSummaryDto>> GetFeaturedAsync(int? currentUserId = null)
    {
        var restaurants = await _restaurantRepo.GetFeaturedAsync(10);
        var favoriteIds = await GetFavoriteIdsAsync(currentUserId);

        return restaurants.Select(r =>
        {
            var dto = _mapper.Map<RestaurantSummaryDto>(r);
            dto.IsFavorite = favoriteIds.Contains(r.Id);
            return dto;
        }).ToList();
    }

    public async Task<RestaurantDto> CreateAsync(int ownerId, CreateRestaurantRequest request)
    {
        // One restaurant per owner for now
        var existing = await _restaurantRepo.GetByOwnerIdAsync(ownerId);
        if (existing != null)
            throw new DomainException("You already have a registered restaurant.");

        var restaurant = _mapper.Map<Restaurant>(request);
        restaurant.OwnerId = ownerId;
        restaurant.Status  = RestaurantStatus.PendingApproval;

        await _restaurantRepo.AddAsync(restaurant);
        await _context.SaveChangesAsync();

        // Add business hours
        if (request.BusinessHours.Any())
        {
            foreach (var h in request.BusinessHours)
            {
                _context.BusinessHours.Add(new BusinessHour
                {
                    RestaurantId = restaurant.Id,
                    DayOfWeek    = h.DayOfWeek,
                    OpenTime     = TimeOnly.Parse(h.OpenTime),
                    CloseTime    = TimeOnly.Parse(h.CloseTime),
                    IsClosed     = h.IsClosed
                });
            }
            await _context.SaveChangesAsync();
        }

        return await GetByIdAsync(restaurant.Id);
    }

    public async Task<RestaurantDto> UpdateAsync(int ownerId, int restaurantId,
        UpdateRestaurantRequest request)
    {
        var restaurant = await GetOwnedRestaurantAsync(ownerId, restaurantId);

        _mapper.Map(request, restaurant);
        await _context.SaveChangesAsync();

        return _mapper.Map<RestaurantDto>(
            await _restaurantRepo.GetWithDetailsAsync(restaurantId));
    }

    public async Task DeleteAsync(int ownerId, int restaurantId)
    {
        var restaurant = await GetOwnedRestaurantAsync(ownerId, restaurantId);
        _restaurantRepo.Remove(restaurant);
        await _context.SaveChangesAsync();
    }

    public async Task<string> UploadLogoAsync(int ownerId, int restaurantId,
        Stream stream, string fileName)
    {
        var restaurant = await GetOwnedRestaurantAsync(ownerId, restaurantId);

        if (!string.IsNullOrWhiteSpace(restaurant.LogoImageUrl))
            await _fileStorage.DeleteAsync(restaurant.LogoImageUrl);

        var url = await _fileStorage.UploadAsync(stream, fileName, "image/jpeg", "restaurant-logos");
        restaurant.LogoImageUrl = url;
        await _context.SaveChangesAsync();
        return url;
    }

    public async Task<string> UploadCoverAsync(int ownerId, int restaurantId,
        Stream stream, string fileName)
    {
        var restaurant = await GetOwnedRestaurantAsync(ownerId, restaurantId);

        if (!string.IsNullOrWhiteSpace(restaurant.CoverImageUrl))
            await _fileStorage.DeleteAsync(restaurant.CoverImageUrl);

        var url = await _fileStorage.UploadAsync(stream, fileName, "image/jpeg", "restaurant-covers");
        restaurant.CoverImageUrl = url;
        await _context.SaveChangesAsync();
        return url;
    }

    public async Task UpdateBusinessHoursAsync(int ownerId, int restaurantId,
        IList<UpsertBusinessHourRequest> hours)
    {
        var restaurant = await GetOwnedRestaurantAsync(ownerId, restaurantId);

        var existing = await _context.BusinessHours
            .Where(b => b.RestaurantId == restaurantId).ToListAsync();
        _context.BusinessHours.RemoveRange(existing);

        foreach (var h in hours)
        {
            _context.BusinessHours.Add(new BusinessHour
            {
                RestaurantId = restaurantId,
                DayOfWeek    = h.DayOfWeek,
                OpenTime     = TimeOnly.Parse(h.OpenTime),
                CloseTime    = TimeOnly.Parse(h.CloseTime),
                IsClosed     = h.IsClosed
            });
        }
        await _context.SaveChangesAsync();
    }

    public async Task<RestaurantDto> GetOwnerRestaurantAsync(int ownerId)
    {
        var restaurant = await _restaurantRepo.GetByOwnerIdAsync(ownerId)
            ?? throw new NotFoundException("You don't have a registered restaurant.");
        return _mapper.Map<RestaurantDto>(restaurant);
    }

    // ── Favorites ─────────────────────────────────────────────────────
    public async Task AddFavoriteAsync(int userId, int restaurantId)
    {
        var exists = await _context.Favorites
            .AnyAsync(f => f.UserId == userId && f.RestaurantId == restaurantId);
        if (exists) return;

        await _context.Favorites.AddAsync(new Favorite
        {
            UserId       = userId,
            RestaurantId = restaurantId
        });
        await _context.SaveChangesAsync();
    }

    public async Task RemoveFavoriteAsync(int userId, int restaurantId)
    {
        var favorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.RestaurantId == restaurantId);
        if (favorite is null) return;

        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();
    }

    public async Task<PagedResult<RestaurantSummaryDto>> GetFavoritesAsync(
        int userId, PaginationRequest pagination)
    {
        var query = _context.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.Restaurant).ThenInclude(r => r.Category)
            .OrderByDescending(f => f.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .Select(f => f.Restaurant)
            .ToListAsync();

        var dtos = items.Select(r =>
        {
            var dto = _mapper.Map<RestaurantSummaryDto>(r);
            dto.IsFavorite = true;
            return dto;
        }).ToList();

        return PagedResult<RestaurantSummaryDto>.Create(dtos, total,
            pagination.PageNumber, pagination.PageSize);
    }

    // ── Admin ─────────────────────────────────────────────────────────
    public async Task<RestaurantDto> ApproveAsync(int restaurantId)
    {
        var restaurant = await _restaurantRepo.GetByIdAsync(restaurantId)
            ?? throw new NotFoundException("Restaurant", restaurantId);
        restaurant.Status = RestaurantStatus.Active;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(restaurantId);
    }

    public async Task<RestaurantDto> SuspendAsync(int restaurantId, string reason)
    {
        var restaurant = await _restaurantRepo.GetByIdAsync(restaurantId)
            ?? throw new NotFoundException("Restaurant", restaurantId);
        restaurant.Status = RestaurantStatus.Suspended;
        await _context.SaveChangesAsync();
        return await GetByIdAsync(restaurantId);
    }

    // ── Private ───────────────────────────────────────────────────────
    private async Task<Restaurant> GetOwnedRestaurantAsync(int ownerId, int restaurantId)
    {
        var restaurant = await _restaurantRepo.GetByIdAsync(restaurantId)
            ?? throw new NotFoundException("Restaurant", restaurantId);

        if (restaurant.OwnerId != ownerId)
            throw new UnauthorizedException("You don't own this restaurant.");

        return restaurant;
    }

    private async Task<HashSet<int>> GetFavoriteIdsAsync(int? userId)
    {
        if (userId is null) return new HashSet<int>();
        var ids = await _context.Favorites
            .Where(f => f.UserId == userId)
            .Select(f => f.RestaurantId)
            .ToListAsync();
        return new HashSet<int>(ids);
    }
}

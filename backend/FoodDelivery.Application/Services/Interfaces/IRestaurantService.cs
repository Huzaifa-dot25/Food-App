using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Restaurant;

namespace FoodDelivery.Application.Services.Interfaces;

public interface IRestaurantService
{
    Task<PagedResult<RestaurantSummaryDto>> SearchAsync(RestaurantSearchRequest request, int? currentUserId = null);
    Task<RestaurantDto> GetByIdAsync(int id, int? currentUserId = null);
    Task<IReadOnlyList<RestaurantSummaryDto>> GetNearbyAsync(double lat, double lng, double radiusKm, int? currentUserId = null);
    Task<IReadOnlyList<RestaurantSummaryDto>> GetFeaturedAsync(int? currentUserId = null);

    // Owner operations
    Task<RestaurantDto> CreateAsync(int ownerId, CreateRestaurantRequest request);
    Task<RestaurantDto> UpdateAsync(int ownerId, int restaurantId, UpdateRestaurantRequest request);
    Task DeleteAsync(int ownerId, int restaurantId);
    Task<string> UploadLogoAsync(int ownerId, int restaurantId, Stream stream, string fileName);
    Task<string> UploadCoverAsync(int ownerId, int restaurantId, Stream stream, string fileName);
    Task UpdateBusinessHoursAsync(int ownerId, int restaurantId, IList<UpsertBusinessHourRequest> hours);
    Task<RestaurantDto> GetOwnerRestaurantAsync(int ownerId);

    // Favorites
    Task AddFavoriteAsync(int userId, int restaurantId);
    Task RemoveFavoriteAsync(int userId, int restaurantId);
    Task<PagedResult<RestaurantSummaryDto>> GetFavoritesAsync(int userId, PaginationRequest pagination);

    // Admin
    Task<RestaurantDto> ApproveAsync(int restaurantId);
    Task<RestaurantDto> SuspendAsync(int restaurantId, string reason);
}

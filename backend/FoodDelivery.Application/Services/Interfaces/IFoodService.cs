using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Food;

namespace FoodDelivery.Application.Services.Interfaces;

public interface IFoodService
{
    // Public browsing
    Task<PagedResult<FoodSummaryDto>> SearchAsync(FoodSearchRequest request);
    Task<FoodDto> GetByIdAsync(int foodId);
    Task<IReadOnlyList<FoodSummaryDto>> GetByRestaurantAsync(int restaurantId, int? categoryId = null);
    Task<IReadOnlyList<FoodSummaryDto>> GetBestSellersAsync(int restaurantId);
    Task<IReadOnlyList<FoodSummaryDto>> GetPopularAsync(int restaurantId);
    Task<IReadOnlyList<FoodSummaryDto>> GetRecommendedAsync(int restaurantId);
    Task<IReadOnlyList<FoodCategoryDto>> GetCategoriesAsync(int restaurantId);

    // Owner CRUD
    Task<FoodDto> CreateAsync(int ownerId, int restaurantId, CreateFoodRequest request);
    Task<FoodDto> UpdateAsync(int ownerId, int restaurantId, int foodId, UpdateFoodRequest request);
    Task DeleteAsync(int ownerId, int restaurantId, int foodId);
    Task ToggleAvailabilityAsync(int ownerId, int restaurantId, int foodId);
    Task<string> UploadImageAsync(int ownerId, int restaurantId, int foodId,
                                  Stream stream, string fileName, bool isPrimary);
    Task DeleteImageAsync(int ownerId, int restaurantId, int foodId, int imageId);

    // Category CRUD (owner)
    Task<FoodCategoryDto> CreateCategoryAsync(int ownerId, int restaurantId, CreateFoodCategoryRequest request);
    Task<FoodCategoryDto> UpdateCategoryAsync(int ownerId, int restaurantId, int categoryId, CreateFoodCategoryRequest request);
    Task DeleteCategoryAsync(int ownerId, int restaurantId, int categoryId);
}

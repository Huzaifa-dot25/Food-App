using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Review;

namespace FoodDelivery.Application.Services.Interfaces;

public interface IReviewService
{
    Task<PagedResult<ReviewDto>> GetRestaurantReviewsAsync(int restaurantId, PaginationRequest pagination);
    Task<ReviewDto> CreateAsync(int customerId, CreateReviewRequest request);
    Task<ReviewDto> ReplyAsync(int ownerId, int reviewId, ReplyToReviewRequest request);
    Task DeleteAsync(int adminId, int reviewId);
}

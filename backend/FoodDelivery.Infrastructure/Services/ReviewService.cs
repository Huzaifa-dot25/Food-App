using AutoMapper;
using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Review;
using FoodDelivery.Application.Services.Interfaces;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _context;
    private readonly IMapper      _mapper;

    public ReviewService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<PagedResult<ReviewDto>> GetRestaurantReviewsAsync(
        int restaurantId, PaginationRequest pagination)
    {
        var query = _context.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Order)
            .Where(r => r.RestaurantId == restaurantId)
            .OrderByDescending(r => r.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        return PagedResult<ReviewDto>.Create(
            _mapper.Map<IReadOnlyList<ReviewDto>>(items),
            total, pagination.PageNumber, pagination.PageSize);
    }

    public async Task<ReviewDto> CreateAsync(int customerId, CreateReviewRequest request)
    {
        // Load the order and validate
        var order = await _context.Orders
            .Include(o => o.Review)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && o.CustomerId == customerId)
            ?? throw new NotFoundException("Order", request.OrderId);

        if (order.Status != OrderStatus.Delivered)
            throw new DomainException("You can only review a delivered order.");

        if (order.Review != null)
            throw new DomainException("You have already reviewed this order.");

        var review = new Review
        {
            OrderId      = order.Id,
            CustomerId   = customerId,
            RestaurantId = order.RestaurantId,
            Rating       = request.Rating,
            Comment      = request.Comment
        };

        await _context.Reviews.AddAsync(review);
        await _context.SaveChangesAsync();

        // Recalculate restaurant rating
        await UpdateRestaurantRatingAsync(order.RestaurantId);

        return _mapper.Map<ReviewDto>(
            await _context.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Order)
                .FirstAsync(r => r.Id == review.Id));
    }

    public async Task<ReviewDto> ReplyAsync(int ownerId, int reviewId,
        ReplyToReviewRequest request)
    {
        var review = await _context.Reviews
            .Include(r => r.Restaurant)
            .Include(r => r.Customer)
            .Include(r => r.Order)
            .FirstOrDefaultAsync(r => r.Id == reviewId)
            ?? throw new NotFoundException("Review", reviewId);

        if (review.Restaurant.OwnerId != ownerId)
            throw new UnauthorizedException("You can only reply to reviews on your own restaurant.");

        review.OwnerReply     = request.Reply;
        review.OwnerRepliedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return _mapper.Map<ReviewDto>(review);
    }

    public async Task DeleteAsync(int adminId, int reviewId)
    {
        var review = await _context.Reviews.FindAsync(reviewId)
            ?? throw new NotFoundException("Review", reviewId);

        var restaurantId = review.RestaurantId;
        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        await UpdateRestaurantRatingAsync(restaurantId);
    }

    private async Task UpdateRestaurantRatingAsync(int restaurantId)
    {
        var stats = await _context.Reviews
            .Where(r => r.RestaurantId == restaurantId)
            .GroupBy(r => r.RestaurantId)
            .Select(g => new { Avg = g.Average(r => (double)r.Rating), Count = g.Count() })
            .FirstOrDefaultAsync();

        var restaurant = await _context.Restaurants.FindAsync(restaurantId);
        if (restaurant is null) return;

        restaurant.AverageRating = stats is not null
            ? Math.Round(stats.Avg, 2)
            : 0;
        restaurant.TotalRatings = stats?.Count ?? 0;
        await _context.SaveChangesAsync();
    }
}

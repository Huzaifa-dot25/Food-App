using AutoMapper;
using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Food;
using FoodDelivery.Application.Services.Interfaces;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using FoodDelivery.Application.Common.Interfaces;

namespace FoodDelivery.Infrastructure.Services;

public class FoodService : IFoodService
{
    private readonly IFoodRepository     _foodRepo;
    private readonly IRestaurantRepository _restaurantRepo;
    private readonly AppDbContext        _context;
    private readonly IFileStorageService _fileStorage;
    private readonly IMapper             _mapper;

    public FoodService(
        IFoodRepository foodRepo,
        IRestaurantRepository restaurantRepo,
        AppDbContext context,
        IFileStorageService fileStorage,
        IMapper mapper)
    {
        _foodRepo       = foodRepo;
        _restaurantRepo = restaurantRepo;
        _context        = context;
        _fileStorage    = fileStorage;
        _mapper         = mapper;
    }

    public async Task<PagedResult<FoodSummaryDto>> SearchAsync(FoodSearchRequest request)
    {
        var (items, total) = await _foodRepo.SearchAsync(request);
        var dtos = _mapper.Map<IReadOnlyList<FoodSummaryDto>>(items);
        return PagedResult<FoodSummaryDto>.Create(dtos, total,
            request.PageNumber, request.PageSize);
    }

    public async Task<FoodDto> GetByIdAsync(int foodId)
    {
        var food = await _foodRepo.GetWithDetailsAsync(foodId)
            ?? throw new NotFoundException("Food", foodId);
        return _mapper.Map<FoodDto>(food);
    }

    public async Task<IReadOnlyList<FoodSummaryDto>> GetByRestaurantAsync(
        int restaurantId, int? categoryId = null)
    {
        var foods = await _foodRepo.GetByRestaurantAsync(restaurantId, categoryId);
        return _mapper.Map<IReadOnlyList<FoodSummaryDto>>(foods);
    }

    public async Task<IReadOnlyList<FoodSummaryDto>> GetBestSellersAsync(int restaurantId)
    {
        var foods = await _context.Foods
            .Include(f => f.Category).Include(f => f.Images)
            .Where(f => f.RestaurantId == restaurantId && f.IsBestSeller && f.IsAvailable)
            .OrderByDescending(f => f.AverageRating).Take(10).ToListAsync();
        return _mapper.Map<IReadOnlyList<FoodSummaryDto>>(foods);
    }

    public async Task<IReadOnlyList<FoodSummaryDto>> GetPopularAsync(int restaurantId)
    {
        var foods = await _context.Foods
            .Include(f => f.Category).Include(f => f.Images)
            .Where(f => f.RestaurantId == restaurantId && f.IsPopular && f.IsAvailable)
            .OrderByDescending(f => f.TotalRatings).Take(10).ToListAsync();
        return _mapper.Map<IReadOnlyList<FoodSummaryDto>>(foods);
    }

    public async Task<IReadOnlyList<FoodSummaryDto>> GetRecommendedAsync(int restaurantId)
    {
        var foods = await _context.Foods
            .Include(f => f.Category).Include(f => f.Images)
            .Where(f => f.RestaurantId == restaurantId && f.IsRecommended && f.IsAvailable)
            .OrderByDescending(f => f.AverageRating).Take(10).ToListAsync();
        return _mapper.Map<IReadOnlyList<FoodSummaryDto>>(foods);
    }

    public async Task<IReadOnlyList<FoodCategoryDto>> GetCategoriesAsync(int restaurantId)
    {
        var cats = await _context.FoodCategories
            .Include(c => c.Foods)
            .Where(c => c.RestaurantId == restaurantId)
            .OrderBy(c => c.SortOrder).ToListAsync();
        return _mapper.Map<IReadOnlyList<FoodCategoryDto>>(cats);
    }

    // ── Owner CRUD ────────────────────────────────────────────────────
    public async Task<FoodDto> CreateAsync(int ownerId, int restaurantId,
        CreateFoodRequest request)
    {
        await AssertOwnershipAsync(ownerId, restaurantId);

        var food = _mapper.Map<Food>(request);
        food.RestaurantId = restaurantId;
        await _context.Foods.AddAsync(food);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(food.Id);
    }

    public async Task<FoodDto> UpdateAsync(int ownerId, int restaurantId,
        int foodId, UpdateFoodRequest request)
    {
        await AssertOwnershipAsync(ownerId, restaurantId);
        var food = await GetOwnedFoodAsync(restaurantId, foodId);
        _mapper.Map(request, food);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(foodId);
    }

    public async Task DeleteAsync(int ownerId, int restaurantId, int foodId)
    {
        await AssertOwnershipAsync(ownerId, restaurantId);
        var food = await GetOwnedFoodAsync(restaurantId, foodId);
        _context.Foods.Remove(food);
        await _context.SaveChangesAsync();
    }

    public async Task ToggleAvailabilityAsync(int ownerId, int restaurantId, int foodId)
    {
        await AssertOwnershipAsync(ownerId, restaurantId);
        var food = await GetOwnedFoodAsync(restaurantId, foodId);
        food.IsAvailable = !food.IsAvailable;
        await _context.SaveChangesAsync();
    }

    public async Task<string> UploadImageAsync(int ownerId, int restaurantId,
        int foodId, Stream stream, string fileName, bool isPrimary)
    {
        await AssertOwnershipAsync(ownerId, restaurantId);
        var food = await GetOwnedFoodAsync(restaurantId, foodId);

        if (isPrimary)
        {
            // Clear existing primary flag
            var existingPrimary = await _context.FoodImages
                .Where(i => i.FoodId == foodId && i.IsPrimary).ToListAsync();
            existingPrimary.ForEach(i => i.IsPrimary = false);
        }

        var url = await _fileStorage.UploadAsync(stream, fileName, "image/jpeg", "foods");
        var sortOrder = await _context.FoodImages.CountAsync(i => i.FoodId == foodId);

        await _context.FoodImages.AddAsync(new FoodImage
        {
            FoodId    = foodId,
            ImageUrl  = url,
            IsPrimary = isPrimary,
            SortOrder = sortOrder
        });
        await _context.SaveChangesAsync();
        return url;
    }

    public async Task DeleteImageAsync(int ownerId, int restaurantId,
        int foodId, int imageId)
    {
        await AssertOwnershipAsync(ownerId, restaurantId);
        var image = await _context.FoodImages
            .FirstOrDefaultAsync(i => i.Id == imageId && i.FoodId == foodId)
            ?? throw new NotFoundException("FoodImage", imageId);

        await _fileStorage.DeleteAsync(image.ImageUrl);
        _context.FoodImages.Remove(image);
        await _context.SaveChangesAsync();
    }

    // ── Category CRUD ─────────────────────────────────────────────────
    public async Task<FoodCategoryDto> CreateCategoryAsync(int ownerId,
        int restaurantId, CreateFoodCategoryRequest request)
    {
        await AssertOwnershipAsync(ownerId, restaurantId);
        var cat = _mapper.Map<FoodCategory>(request);
        cat.RestaurantId = restaurantId;
        await _context.FoodCategories.AddAsync(cat);
        await _context.SaveChangesAsync();
        return _mapper.Map<FoodCategoryDto>(cat);
    }

    public async Task<FoodCategoryDto> UpdateCategoryAsync(int ownerId,
        int restaurantId, int categoryId, CreateFoodCategoryRequest request)
    {
        await AssertOwnershipAsync(ownerId, restaurantId);
        var cat = await _context.FoodCategories
            .FirstOrDefaultAsync(c => c.Id == categoryId && c.RestaurantId == restaurantId)
            ?? throw new NotFoundException("FoodCategory", categoryId);
        _mapper.Map(request, cat);
        await _context.SaveChangesAsync();
        return _mapper.Map<FoodCategoryDto>(cat);
    }

    public async Task DeleteCategoryAsync(int ownerId, int restaurantId, int categoryId)
    {
        await AssertOwnershipAsync(ownerId, restaurantId);
        var cat = await _context.FoodCategories
            .FirstOrDefaultAsync(c => c.Id == categoryId && c.RestaurantId == restaurantId)
            ?? throw new NotFoundException("FoodCategory", categoryId);
        _context.FoodCategories.Remove(cat);
        await _context.SaveChangesAsync();
    }

    // ── Helpers ───────────────────────────────────────────────────────
    private async Task AssertOwnershipAsync(int ownerId, int restaurantId)
    {
        var owned = await _context.Restaurants
            .AnyAsync(r => r.Id == restaurantId && r.OwnerId == ownerId);
        if (!owned)
            throw new UnauthorizedException(
                "You don't have permission to manage this restaurant's menu.");
    }

    private async Task<Food> GetOwnedFoodAsync(int restaurantId, int foodId)
    {
        var food = await _foodRepo.GetWithDetailsAsync(foodId)
            ?? throw new NotFoundException("Food", foodId);
        if (food.RestaurantId != restaurantId)
            throw new UnauthorizedException("Food does not belong to this restaurant.");
        return food;
    }
}

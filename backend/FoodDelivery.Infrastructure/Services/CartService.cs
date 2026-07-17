using AutoMapper;
using FoodDelivery.Application.DTOs.Cart;
using FoodDelivery.Application.Services.Interfaces;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Services;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepo;
    private readonly AppDbContext    _context;
    private readonly IMapper         _mapper;

    public CartService(ICartRepository cartRepo, AppDbContext context, IMapper mapper)
    {
        _cartRepo = cartRepo;
        _context  = context;
        _mapper   = mapper;
    }

    public async Task<CartDto> GetCartAsync(int customerId)
    {
        var cart = await _cartRepo.GetActiveCartAsync(customerId);
        if (cart is null) return new CartDto();
        return await BuildCartDtoAsync(cart);
    }

    public async Task<CartDto> AddItemAsync(int customerId, AddCartItemRequest request)
    {
        var food = await _context.Foods
            .Include(f => f.Images)
            .Include(f => f.Restaurant)
            .FirstOrDefaultAsync(f => f.Id == request.FoodId)
            ?? throw new NotFoundException("Food", request.FoodId);

        if (!food.IsAvailable)
            throw new DomainException("This item is currently unavailable.");

        // Get or create cart
        var cart = await _cartRepo.GetActiveCartAsync(customerId);

        if (cart is null)
        {
            cart = new Cart
            {
                CustomerId   = customerId,
                RestaurantId = food.RestaurantId
            };
            await _cartRepo.AddAsync(cart);
            await _context.SaveChangesAsync();
        }
        else if (cart.RestaurantId != food.RestaurantId)
        {
            // Different restaurant — clear cart first
            throw new DomainException(
                "Your cart contains items from a different restaurant. " +
                "Clear your cart before adding items from a new restaurant.");
        }

        // Check if item already in cart
        var existingItem = cart.Items.FirstOrDefault(i => i.FoodId == request.FoodId);
        if (existingItem is not null)
        {
            existingItem.Quantity += request.Quantity;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                CartId    = cart.Id,
                FoodId    = food.Id,
                Quantity  = request.Quantity,
                UnitPrice = food.EffectivePrice
            });
        }

        await _context.SaveChangesAsync();
        return await BuildCartDtoAsync(await _cartRepo.GetActiveCartAsync(customerId)!);
    }

    public async Task<CartDto> UpdateItemAsync(int customerId, int cartItemId,
        UpdateCartItemRequest request)
    {
        var cart = await GetCustomerCartAsync(customerId);
        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId)
            ?? throw new NotFoundException("CartItem", cartItemId);

        if (request.Quantity <= 0)
        {
            cart.Items.Remove(item);
            _context.CartItems.Remove(item);
        }
        else
        {
            item.Quantity = request.Quantity;
        }

        if (!cart.Items.Any())
        {
            cart.RestaurantId = null;
            cart.CouponId     = null;
        }

        await _context.SaveChangesAsync();
        return await BuildCartDtoAsync(await _cartRepo.GetActiveCartAsync(customerId)!);
    }

    public async Task<CartDto> RemoveItemAsync(int customerId, int cartItemId)
        => await UpdateItemAsync(customerId, cartItemId, new UpdateCartItemRequest { Quantity = 0 });

    public async Task<CartDto> ApplyCouponAsync(int customerId, ApplyCouponRequest request)
    {
        var cart = await GetCustomerCartAsync(customerId);

        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code.ToUpper() == request.CouponCode.ToUpper())
            ?? throw new NotFoundException($"Coupon '{request.CouponCode}' not found.");

        if (!coupon.IsValid)
            throw new DomainException("This coupon is expired or has reached its usage limit.");

        var subtotal = cart.Items.Sum(i => i.UnitPrice * i.Quantity);
        if (subtotal < coupon.MinOrderAmount)
            throw new DomainException(
                $"Minimum order amount for this coupon is ${coupon.MinOrderAmount:F2}.");

        cart.CouponId = coupon.Id;
        await _context.SaveChangesAsync();

        return await BuildCartDtoAsync(await _cartRepo.GetActiveCartAsync(customerId)!);
    }

    public async Task<CartDto> RemoveCouponAsync(int customerId)
    {
        var cart = await GetCustomerCartAsync(customerId);
        cart.CouponId = null;
        await _context.SaveChangesAsync();
        return await BuildCartDtoAsync(await _cartRepo.GetActiveCartAsync(customerId)!);
    }

    public async Task ClearCartAsync(int customerId)
    {
        var cart = await _cartRepo.GetActiveCartAsync(customerId);
        if (cart is null) return;

        _context.CartItems.RemoveRange(cart.Items);
        cart.RestaurantId = null;
        cart.CouponId     = null;
        await _context.SaveChangesAsync();
    }

    // ── Helpers ───────────────────────────────────────────────────────
    private async Task<Cart> GetCustomerCartAsync(int customerId)
        => await _cartRepo.GetActiveCartAsync(customerId)
           ?? throw new NotFoundException("No active cart found.");

    private async Task<CartDto> BuildCartDtoAsync(Cart cart)
    {
        var dto = _mapper.Map<CartDto>(cart);

        // Calculate delivery fee from restaurant
        decimal deliveryFee = 0;
        if (cart.RestaurantId.HasValue)
        {
            var restaurant = await _context.Restaurants
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == cart.RestaurantId.Value);
            deliveryFee = restaurant?.DeliveryFee ?? 0;
        }

        var subtotal       = cart.Items.Sum(i => i.UnitPrice * i.Quantity);
        decimal discount   = 0;

        if (cart.Coupon is not null && cart.Coupon.IsValid)
        {
            discount = cart.Coupon.DiscountType == Domain.Enums.DiscountType.Percentage
                ? subtotal * cart.Coupon.DiscountValue / 100
                : cart.Coupon.DiscountValue;

            if (cart.Coupon.MaxDiscountAmount.HasValue)
                discount = Math.Min(discount, cart.Coupon.MaxDiscountAmount.Value);
        }

        dto.DeliveryFee    = deliveryFee;
        dto.DiscountAmount = discount;
        dto.Total          = subtotal - discount + deliveryFee;
        return dto;
    }
}

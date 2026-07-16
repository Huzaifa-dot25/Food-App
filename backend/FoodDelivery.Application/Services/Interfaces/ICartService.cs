using FoodDelivery.Application.DTOs.Cart;

namespace FoodDelivery.Application.Services.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartAsync(int customerId);
    Task<CartDto> AddItemAsync(int customerId, AddCartItemRequest request);
    Task<CartDto> UpdateItemAsync(int customerId, int cartItemId, UpdateCartItemRequest request);
    Task<CartDto> RemoveItemAsync(int customerId, int cartItemId);
    Task<CartDto> ApplyCouponAsync(int customerId, ApplyCouponRequest request);
    Task<CartDto> RemoveCouponAsync(int customerId);
    Task ClearCartAsync(int customerId);
}

using AutoMapper;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using FoodDelivery.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace FoodDelivery.Tests.Unit;

public class CartServiceTests
{
    private readonly AppDbContext       _db;
    private readonly Mock<ICartRepository> _cartRepoMock = new();
    private readonly Mock<IMapper>      _mapperMock   = new();
    private readonly CartService        _cartService;

    public CartServiceTests()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(opts);

        _cartService = new CartService(_cartRepoMock.Object, _db, _mapperMock.Object);
    }

    // ── AddItem Tests ──────────────────────────────────────────────

    [Fact]
    public async Task AddItem_ToEmptyCart_CreatesNewCart()
    {
        // Arrange
        const int customerId  = 1;
        const int restaurantId = 5;
        const int foodId       = 10;

        var restaurant = new Restaurant { Id = restaurantId, Name = "Test", DeliveryFee = 2.50m,
            OwnerId = 1, CategoryId = 1, Street = "s", City = "c", State = "st", ZipCode = "z" };
        var food = new Food
        {
            Id           = foodId,
            RestaurantId = restaurantId,
            Restaurant   = restaurant,
            CategoryId   = 1,
            Name         = "Burger",
            Price        = 10.00m,
            IsAvailable  = true
        };
        _db.Restaurants.Add(restaurant);
        _db.Foods.Add(food);
        await _db.SaveChangesAsync();

        // No existing cart
        _cartRepoMock.Setup(r => r.GetActiveCartAsync(customerId)).ReturnsAsync((Cart?)null);
        _cartRepoMock.Setup(r => r.AddAsync(It.IsAny<Cart>()))
            .Callback<Cart>(c => { c.Id = 1; c.Items = new List<CartItem>(); })
            .Returns(Task.CompletedTask);

        // After adding, return the new cart
        _cartRepoMock.SetupSequence(r => r.GetActiveCartAsync(customerId))
            .ReturnsAsync((Cart?)null)
            .ReturnsAsync(new Cart
            {
                Id           = 1,
                CustomerId   = customerId,
                RestaurantId = restaurantId,
                Restaurant   = restaurant,
                Items        = new List<CartItem>
                {
                    new() { FoodId = foodId, Food = food, Quantity = 1, UnitPrice = 10.00m }
                }
            });

        _mapperMock.Setup(m => m.Map<Application.DTOs.Cart.CartDto>(It.IsAny<Cart>()))
            .Returns(new Application.DTOs.Cart.CartDto
            {
                RestaurantId   = restaurantId,
                RestaurantName = "Test",
                ItemCount      = 1,
                Subtotal       = 10.00m,
            });

        // Act
        var result = await _cartService.AddItemAsync(customerId,
            new Application.DTOs.Cart.AddCartItemRequest { FoodId = foodId, Quantity = 1 });

        // Assert
        result.Should().NotBeNull();
        result.ItemCount.Should().Be(1);
    }

    [Fact]
    public async Task AddItem_UnavailableFood_ThrowsDomainException()
    {
        // Arrange
        const int customerId = 1;
        var food = new Food
        {
            Id           = 99,
            RestaurantId = 5,
            CategoryId   = 1,
            Name         = "Unavailable",
            Price        = 5.00m,
            IsAvailable  = false      // not available
        };
        _db.Foods.Add(food);
        await _db.SaveChangesAsync();

        _cartRepoMock.Setup(r => r.GetActiveCartAsync(customerId)).ReturnsAsync((Cart?)null);

        // Act
        Func<Task> act = async () => await _cartService.AddItemAsync(customerId,
            new Application.DTOs.Cart.AddCartItemRequest { FoodId = 99, Quantity = 1 });

        // Assert
        await act.Should().ThrowAsync<DomainException>()
            .WithMessage("*unavailable*");
    }

    [Fact]
    public async Task AddItem_DifferentRestaurant_ThrowsDomainException()
    {
        // Arrange
        const int customerId = 1;

        var restaurant1 = new Restaurant { Id = 1, Name = "R1", OwnerId = 1, CategoryId = 1,
            Street = "s", City = "c", State = "st", ZipCode = "z" };
        var restaurant2 = new Restaurant { Id = 2, Name = "R2", OwnerId = 1, CategoryId = 1,
            Street = "s", City = "c", State = "st", ZipCode = "z" };
        var food2 = new Food { Id = 20, RestaurantId = 2, Restaurant = restaurant2,
            CategoryId = 1, Name = "Pizza", Price = 12m, IsAvailable = true };

        _db.Restaurants.AddRange(restaurant1, restaurant2);
        _db.Foods.Add(food2);
        await _db.SaveChangesAsync();

        // Existing cart with restaurant1
        _cartRepoMock.Setup(r => r.GetActiveCartAsync(customerId))
            .ReturnsAsync(new Cart
            {
                Id           = 1,
                CustomerId   = customerId,
                RestaurantId = 1,  // different restaurant
                Items        = new List<CartItem>()
            });

        // Act
        Func<Task> act = async () => await _cartService.AddItemAsync(customerId,
            new Application.DTOs.Cart.AddCartItemRequest { FoodId = 20, Quantity = 1 });

        // Assert
        await act.Should().ThrowAsync<DomainException>()
            .WithMessage("*different restaurant*");
    }
}

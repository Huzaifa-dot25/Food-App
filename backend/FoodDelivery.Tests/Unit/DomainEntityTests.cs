using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace FoodDelivery.Tests.Unit;

public class DomainEntityTests
{
    // ── Food entity ────────────────────────────────────────────────

    [Fact]
    public void Food_EffectivePrice_ReturnsDiscountPriceWhenSet()
    {
        var food = new Food { Price = 10.00m, DiscountPrice = 7.50m };
        food.EffectivePrice.Should().Be(7.50m);
    }

    [Fact]
    public void Food_EffectivePrice_ReturnsRegularPriceWhenNoDiscount()
    {
        var food = new Food { Price = 10.00m, DiscountPrice = null };
        food.EffectivePrice.Should().Be(10.00m);
    }

    [Fact]
    public void Food_EffectivePrice_IgnoresDiscountIfHigherThanPrice()
    {
        var food = new Food { Price = 10.00m, DiscountPrice = 15.00m };
        food.EffectivePrice.Should().Be(10.00m);
    }

    // ── Coupon entity ──────────────────────────────────────────────

    [Fact]
    public void Coupon_IsValid_TrueWhenActiveAndNotExpiredAndUnderLimit()
    {
        var coupon = new Coupon
        {
            IsActive   = true,
            ExpiryDate = DateTime.UtcNow.AddDays(1),
            UsageLimit = 10,
            UsedCount  = 5
        };

        coupon.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Coupon_IsValid_FalseWhenExpired()
    {
        var coupon = new Coupon
        {
            IsActive   = true,
            ExpiryDate = DateTime.UtcNow.AddDays(-1), // expired
            UsageLimit = 10,
            UsedCount  = 0
        };

        coupon.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Coupon_IsValid_FalseWhenUsageLimitReached()
    {
        var coupon = new Coupon
        {
            IsActive   = true,
            ExpiryDate = DateTime.UtcNow.AddDays(1),
            UsageLimit = 5,
            UsedCount  = 5  // limit reached
        };

        coupon.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Coupon_IsValid_FalseWhenInactive()
    {
        var coupon = new Coupon
        {
            IsActive   = false,
            ExpiryDate = DateTime.UtcNow.AddDays(1),
            UsageLimit = 10,
            UsedCount  = 0
        };

        coupon.IsValid.Should().BeFalse();
    }

    // ── Cart entity ────────────────────────────────────────────────

    [Fact]
    public void Cart_Subtotal_SumsAllItemTotals()
    {
        var cart = new Cart
        {
            Items = new List<CartItem>
            {
                new() { Quantity = 2, UnitPrice = 10.00m },
                new() { Quantity = 1, UnitPrice = 5.50m },
                new() { Quantity = 3, UnitPrice = 3.00m },
            }
        };

        cart.Subtotal.Should().Be(34.50m); // 20 + 5.5 + 9
    }

    [Fact]
    public void Cart_Subtotal_ZeroWhenNoItems()
    {
        var cart = new Cart { Items = new List<CartItem>() };
        cart.Subtotal.Should().Be(0);
    }

    // ── User entity ────────────────────────────────────────────────

    [Fact]
    public void User_FullName_ConcatenatesFirstAndLastName()
    {
        var user = new User { FirstName = "John", LastName = "Doe" };
        user.FullName.Should().Be("John Doe");
    }

    // ── CartItem entity ────────────────────────────────────────────

    [Fact]
    public void CartItem_TotalPrice_IsUnitPriceTimesQuantity()
    {
        var item = new CartItem { UnitPrice = 9.99m, Quantity = 3 };
        item.TotalPrice.Should().Be(29.97m);
    }
}

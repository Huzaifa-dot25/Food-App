using FoodDelivery.Application.DTOs.Auth;
using FoodDelivery.Application.DTOs.Food;
using FoodDelivery.Application.DTOs.Restaurant;
using FoodDelivery.Application.Validators;
using FluentAssertions;
using Xunit;

namespace FoodDelivery.Tests.Unit;

public class ValidatorTests
{
    // ── RegisterRequest Validator ──────────────────────────────────

    [Theory]
    [InlineData("John", "Doe", "john@test.com", "+1234567890", "Test@1234", "Test@1234", "Customer", true)]
    [InlineData("",     "Doe", "john@test.com", "+1234567890", "Test@1234", "Test@1234", "Customer", false)] // empty first name
    [InlineData("John", "Doe", "invalid-email", "+1234567890", "Test@1234", "Test@1234", "Customer", false)] // bad email
    [InlineData("John", "Doe", "john@test.com", "+1234567890", "weak",      "weak",      "Customer", false)] // weak password
    [InlineData("John", "Doe", "john@test.com", "+1234567890", "Test@1234", "Different1!", "Customer", false)] // password mismatch
    [InlineData("John", "Doe", "john@test.com", "+1234567890", "Test@1234", "Test@1234", "Admin",    false)] // invalid role
    public void RegisterValidator_VariousInputs_ReturnsExpectedResult(
        string firstName, string lastName, string email, string phone,
        string password, string confirmPassword, string role, bool shouldBeValid)
    {
        var validator = new RegisterRequestValidator();
        var request   = new RegisterRequest
        {
            FirstName       = firstName,
            LastName        = lastName,
            Email           = email,
            PhoneNumber     = phone,
            Password        = password,
            ConfirmPassword = confirmPassword,
            Role            = role
        };

        var result = validator.Validate(request);
        result.IsValid.Should().Be(shouldBeValid);
    }

    [Fact]
    public void RegisterValidator_PasswordTooShort_HasCorrectErrorMessage()
    {
        var validator = new RegisterRequestValidator();
        var result    = validator.Validate(new RegisterRequest
        {
            FirstName = "A", LastName = "B", Email = "a@b.com",
            PhoneNumber = "+1234567890",
            Password = "Ab1!", ConfirmPassword = "Ab1!", Role = "Customer"
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.PropertyName == "Password" && e.ErrorMessage.Contains("8"));
    }

    // ── CreateFoodRequest Validator ────────────────────────────────

    [Fact]
    public void FoodValidator_ValidRequest_Passes()
    {
        var validator = new CreateFoodRequestValidator();
        var result    = validator.Validate(new CreateFoodRequest
        {
            CategoryId  = 1,
            Name        = "Burger",
            Description = "Delicious",
            Price       = 9.99m
        });

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void FoodValidator_ZeroPrice_Fails()
    {
        var validator = new CreateFoodRequestValidator();
        var result    = validator.Validate(new CreateFoodRequest
        {
            CategoryId = 1, Name = "Free Burger", Price = 0
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Price");
    }

    [Fact]
    public void FoodValidator_DiscountHigherThanPrice_Fails()
    {
        var validator = new CreateFoodRequestValidator();
        var result    = validator.Validate(new CreateFoodRequest
        {
            CategoryId    = 1,
            Name          = "Burger",
            Price         = 5.00m,
            DiscountPrice = 8.00m  // higher than Price
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "DiscountPrice");
    }

    // ── CreateRestaurantRequest Validator ──────────────────────────

    [Fact]
    public void RestaurantValidator_ValidRequest_Passes()
    {
        var validator = new CreateRestaurantRequestValidator();
        var result    = validator.Validate(new CreateRestaurantRequest
        {
            Name        = "My Restaurant",
            CategoryId  = 1,
            Street      = "123 Main St",
            City        = "Karachi",
            State       = "Sindh",
            ZipCode     = "74000",
            Latitude    = 24.86,
            Longitude   = 67.01,
            DeliveryFee = 2.00m,
            EstimatedDeliveryTimeMinutes = 30
        });

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void RestaurantValidator_InvalidLatitude_Fails()
    {
        var validator = new CreateRestaurantRequestValidator();
        var result    = validator.Validate(new CreateRestaurantRequest
        {
            Name = "R", CategoryId = 1, Street = "S",
            City = "C", State = "S", ZipCode = "Z",
            Latitude  = 999,   // invalid
            Longitude = 67.01,
            DeliveryFee = 0, EstimatedDeliveryTimeMinutes = 30
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Latitude");
    }

    [Fact]
    public void RestaurantValidator_InvalidEmail_Fails()
    {
        var validator = new CreateRestaurantRequestValidator();
        var result    = validator.Validate(new CreateRestaurantRequest
        {
            Name = "R", CategoryId = 1, Street = "S",
            City = "C", State = "S", ZipCode = "Z",
            Latitude = 24.0, Longitude = 67.0,
            DeliveryFee = 0, EstimatedDeliveryTimeMinutes = 30,
            Email = "not-an-email"
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    // ── AddCartItem Validator ──────────────────────────────────────

    [Theory]
    [InlineData(1,   1,   true)]
    [InlineData(0,   1,   false)] // invalid foodId
    [InlineData(1,   0,   false)] // zero quantity
    [InlineData(1,   51,  false)] // too many
    [InlineData(1,   50,  true)]  // max allowed
    public void CartItemValidator_VariousInputs_ReturnsExpected(
        int foodId, int quantity, bool expected)
    {
        var validator = new AddCartItemRequestValidator();
        var result    = validator.Validate(
            new Application.DTOs.Cart.AddCartItemRequest
            {
                FoodId   = foodId,
                Quantity = quantity
            });

        result.IsValid.Should().Be(expected);
    }

    // ── CreateReview Validator ─────────────────────────────────────

    [Theory]
    [InlineData(1,  1, true)]
    [InlineData(1,  5, true)]
    [InlineData(1,  0, false)] // rating 0
    [InlineData(1,  6, false)] // rating 6
    [InlineData(0,  3, false)] // orderId 0
    public void ReviewValidator_VariousRatings_ReturnsExpected(
        int orderId, int rating, bool expected)
    {
        var validator = new CreateReviewRequestValidator();
        var result    = validator.Validate(
            new Application.DTOs.Review.CreateReviewRequest
            {
                OrderId = orderId,
                Rating  = rating
            });

        result.IsValid.Should().Be(expected);
    }
}

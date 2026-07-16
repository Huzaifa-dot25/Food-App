using FluentValidation;
using FoodDelivery.Application.DTOs.Order;
using FoodDelivery.Domain.Enums;

namespace FoodDelivery.Application.Validators;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.AddressId).GreaterThan(0).WithMessage("A valid delivery address is required.");
        RuleFor(x => x.PaymentMethod)
            .IsInEnum().WithMessage("Invalid payment method.");
    }
}

public class CreateReviewRequestValidator : AbstractValidator<DTOs.Review.CreateReviewRequest>
{
    public CreateReviewRequestValidator()
    {
        RuleFor(x => x.OrderId).GreaterThan(0);
        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");
        RuleFor(x => x.Comment)
            .MaximumLength(1000).When(x => x.Comment != null);
    }
}

public class AddCartItemRequestValidator : AbstractValidator<DTOs.Cart.AddCartItemRequest>
{
    public AddCartItemRequestValidator()
    {
        RuleFor(x => x.FoodId).GreaterThan(0).WithMessage("A valid food item is required.");
        RuleFor(x => x.Quantity)
            .InclusiveBetween(1, 50).WithMessage("Quantity must be between 1 and 50.");
    }
}

using FluentValidation;
using FoodDelivery.Application.DTOs.Food;

namespace FoodDelivery.Application.Validators;

public class CreateFoodRequestValidator : AbstractValidator<CreateFoodRequest>
{
    public CreateFoodRequestValidator()
    {
        RuleFor(x => x.CategoryId).GreaterThan(0).WithMessage("A valid food category is required.");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.Price).GreaterThan(0).WithMessage("Price must be greater than zero.");
        RuleFor(x => x.DiscountPrice)
            .LessThan(x => x.Price)
            .When(x => x.DiscountPrice.HasValue)
            .WithMessage("Discount price must be less than the regular price.");
    }
}

public class CreateFoodCategoryRequestValidator : AbstractValidator<CreateFoodCategoryRequest>
{
    public CreateFoodCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(500).When(x => x.Description != null);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }
}

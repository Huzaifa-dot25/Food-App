using FoodDelivery.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodDelivery.Infrastructure.Persistence.Configurations;

public class FoodConfiguration : IEntityTypeConfiguration<Food>
{
    public void Configure(EntityTypeBuilder<Food> builder)
    {
        builder.ToTable("Foods");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.Name).IsRequired().HasMaxLength(200);
        builder.Property(f => f.Description).HasMaxLength(1000);
        builder.Property(f => f.Price).IsRequired().HasPrecision(10, 2);
        builder.Property(f => f.DiscountPrice).HasPrecision(10, 2);
        builder.Property(f => f.AverageRating).HasPrecision(3, 2);

        // Ignore computed property (not mapped to DB)
        builder.Ignore(f => f.EffectivePrice);

        builder.HasIndex(f => f.RestaurantId).HasDatabaseName("IX_Foods_RestaurantId");
        builder.HasIndex(f => f.CategoryId).HasDatabaseName("IX_Foods_CategoryId");
        builder.HasIndex(f => f.IsAvailable).HasDatabaseName("IX_Foods_IsAvailable");

        builder.HasOne(f => f.Category)
            .WithMany(c => c.Foods)
            .HasForeignKey(f => f.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Restaurant relationship already configured via RestaurantConfiguration
        builder.HasMany(f => f.Images)
            .WithOne(img => img.Food)
            .HasForeignKey(img => img.FoodId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

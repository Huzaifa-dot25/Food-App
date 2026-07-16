using FoodDelivery.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodDelivery.Infrastructure.Persistence.Configurations;

public class RestaurantConfiguration : IEntityTypeConfiguration<Restaurant>
{
    public void Configure(EntityTypeBuilder<Restaurant> builder)
    {
        builder.ToTable("Restaurants");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name).IsRequired().HasMaxLength(200);
        builder.Property(r => r.Description).HasMaxLength(2000);
        builder.Property(r => r.LogoImageUrl).HasMaxLength(500);
        builder.Property(r => r.CoverImageUrl).HasMaxLength(500);
        builder.Property(r => r.Street).IsRequired().HasMaxLength(300);
        builder.Property(r => r.City).IsRequired().HasMaxLength(100);
        builder.Property(r => r.State).IsRequired().HasMaxLength(100);
        builder.Property(r => r.ZipCode).IsRequired().HasMaxLength(20);
        builder.Property(r => r.Phone).HasMaxLength(20);
        builder.Property(r => r.Email).HasMaxLength(256);

        builder.Property(r => r.DeliveryFee).HasPrecision(10, 2);
        builder.Property(r => r.MinOrderAmount).HasPrecision(10, 2);
        builder.Property(r => r.AverageRating).HasPrecision(3, 2);

        builder.Property(r => r.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        // Indexes
        builder.HasIndex(r => r.OwnerId).HasDatabaseName("IX_Restaurants_OwnerId");
        builder.HasIndex(r => r.CategoryId).HasDatabaseName("IX_Restaurants_CategoryId");
        builder.HasIndex(r => r.Status).HasDatabaseName("IX_Restaurants_Status");
        builder.HasIndex(r => new { r.Latitude, r.Longitude }).HasDatabaseName("IX_Restaurants_Location");

        // Owner FK (Restrict to avoid cascade path conflicts)
        builder.HasOne(r => r.Owner)
            .WithMany(u => u.OwnedRestaurants)
            .HasForeignKey(r => r.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Category)
            .WithMany(c => c.Restaurants)
            .HasForeignKey(r => r.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(r => r.BusinessHours)
            .WithOne(b => b.Restaurant)
            .HasForeignKey(b => b.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.FoodCategories)
            .WithOne(fc => fc.Restaurant)
            .HasForeignKey(fc => fc.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.Foods)
            .WithOne(f => f.Restaurant)
            .HasForeignKey(f => f.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.Reviews)
            .WithOne(rv => rv.Restaurant)
            .HasForeignKey(rv => rv.RestaurantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(r => r.Favorites)
            .WithOne(fav => fav.Restaurant)
            .HasForeignKey(fav => fav.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

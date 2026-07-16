using FoodDelivery.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodDelivery.Infrastructure.Persistence.Configurations;

public class FavoriteConfiguration : IEntityTypeConfiguration<Favorite>
{
    public void Configure(EntityTypeBuilder<Favorite> builder)
    {
        builder.ToTable("Favorites");

        builder.HasKey(f => f.Id);

        // Prevent duplicate favorites
        builder.HasIndex(f => new { f.UserId, f.RestaurantId })
            .IsUnique()
            .HasDatabaseName("IX_Favorites_User_Restaurant");
    }
}

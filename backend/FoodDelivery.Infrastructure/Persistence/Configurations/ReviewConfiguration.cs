using FoodDelivery.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodDelivery.Infrastructure.Persistence.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Comment).HasMaxLength(1000);
        builder.Property(r => r.OwnerReply).HasMaxLength(1000);

        // One review per delivered order (enforced at DB level too)
        builder.HasIndex(r => r.OrderId).IsUnique().HasDatabaseName("IX_Reviews_OrderId");
        builder.HasIndex(r => r.RestaurantId).HasDatabaseName("IX_Reviews_RestaurantId");

        // Customer FK — restrict to avoid multiple cascade paths
        builder.HasOne(r => r.Customer)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

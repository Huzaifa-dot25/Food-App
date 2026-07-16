using FoodDelivery.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodDelivery.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber).IsRequired().HasMaxLength(30);
        builder.Property(o => o.DeliveryInstructions).HasMaxLength(500);
        builder.Property(o => o.CancellationReason).HasMaxLength(500);

        builder.Property(o => o.SubTotal).HasPrecision(10, 2);
        builder.Property(o => o.DiscountAmount).HasPrecision(10, 2);
        builder.Property(o => o.DeliveryFee).HasPrecision(10, 2);
        builder.Property(o => o.TotalAmount).HasPrecision(10, 2);

        builder.Property(o => o.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(o => o.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(30);

        // Unique order number
        builder.HasIndex(o => o.OrderNumber).IsUnique().HasDatabaseName("IX_Orders_OrderNumber");
        builder.HasIndex(o => o.CustomerId).HasDatabaseName("IX_Orders_CustomerId");
        builder.HasIndex(o => o.RestaurantId).HasDatabaseName("IX_Orders_RestaurantId");
        builder.HasIndex(o => o.Status).HasDatabaseName("IX_Orders_Status");
        builder.HasIndex(o => o.CreatedAt).HasDatabaseName("IX_Orders_CreatedAt");

        builder.HasOne(o => o.Address)
            .WithMany(a => a.Orders)
            .HasForeignKey(o => o.AddressId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Coupon)
            .WithMany(c => c.Orders)
            .HasForeignKey(o => o.CouponId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(o => o.Restaurant)
            .WithMany(r => r.Orders)
            .HasForeignKey(o => o.RestaurantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(o => o.Items)
            .WithOne(oi => oi.Order)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.Payment)
            .WithOne(p => p.Order)
            .HasForeignKey<Payment>(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.RiderAssignment)
            .WithOne(ra => ra.Order)
            .HasForeignKey<RiderAssignment>(ra => ra.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(o => o.Review)
            .WithOne(r => r.Order)
            .HasForeignKey<Review>(r => r.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

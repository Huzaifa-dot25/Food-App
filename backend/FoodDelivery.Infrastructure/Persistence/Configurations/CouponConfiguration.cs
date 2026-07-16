using FoodDelivery.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodDelivery.Infrastructure.Persistence.Configurations;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("Coupons");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code).IsRequired().HasMaxLength(30);
        builder.Property(c => c.Description).HasMaxLength(500);
        builder.Property(c => c.DiscountValue).HasPrecision(10, 2);
        builder.Property(c => c.MinOrderAmount).HasPrecision(10, 2);
        builder.Property(c => c.MaxDiscountAmount).HasPrecision(10, 2);

        builder.Property(c => c.DiscountType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Ignore(c => c.IsValid);

        builder.HasIndex(c => c.Code).IsUnique().HasDatabaseName("IX_Coupons_Code");
    }
}

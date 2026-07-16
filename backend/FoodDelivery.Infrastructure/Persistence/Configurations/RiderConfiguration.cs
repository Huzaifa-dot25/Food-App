using FoodDelivery.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodDelivery.Infrastructure.Persistence.Configurations;

public class RiderConfiguration : IEntityTypeConfiguration<Rider>
{
    public void Configure(EntityTypeBuilder<Rider> builder)
    {
        builder.ToTable("Riders");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.VehiclePlate).HasMaxLength(20);
        builder.Property(r => r.LicenseNumber).HasMaxLength(50);
        builder.Property(r => r.TotalEarnings).HasPrecision(12, 2);

        builder.Property(r => r.VehicleType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(r => r.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        // UserId is unique (one rider profile per user)
        builder.HasIndex(r => r.UserId).IsUnique().HasDatabaseName("IX_Riders_UserId");

        builder.HasMany(r => r.Assignments)
            .WithOne(a => a.Rider)
            .HasForeignKey(a => a.RiderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

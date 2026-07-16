using FoodDelivery.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace FoodDelivery.Infrastructure.Persistence;

/// <summary>
/// Main EF Core DbContext. All entity configurations are loaded from the
/// Configurations folder via ApplyConfigurationsFromAssembly.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Identity
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    // Location
    public DbSet<Address> Addresses => Set<Address>();

    // Restaurant catalog
    public DbSet<RestaurantCategory> RestaurantCategories => Set<RestaurantCategory>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<BusinessHour> BusinessHours => Set<BusinessHour>();
    public DbSet<FoodCategory> FoodCategories => Set<FoodCategory>();
    public DbSet<Food> Foods => Set<Food>();
    public DbSet<FoodImage> FoodImages => Set<FoodImage>();

    // Shopping
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Coupon> Coupons => Set<Coupon>();

    // Orders & Payments
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();

    // Delivery
    public DbSet<Rider> Riders => Set<Rider>();
    public DbSet<RiderAssignment> RiderAssignments => Set<RiderAssignment>();

    // Social
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Favorite> Favorites => Set<Favorite>();

    // System
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all IEntityTypeConfiguration<T> classes in this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Configure the UserRole composite primary key here
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("UserRoles");
            entity.HasKey(ur => new { ur.UserId, ur.RoleId });

            entity.HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Customer" },
            new Role { Id = 2, Name = "Owner" },
            new Role { Id = 3, Name = "Rider" },
            new Role { Id = 4, Name = "Admin" }
        );
    }

    /// <summary>
    /// Intercept SaveChanges to auto-update UpdatedAt timestamps.
    /// </summary>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}

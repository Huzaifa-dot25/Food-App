using FoodDelivery.Application.Common.Interfaces;

namespace FoodDelivery.Infrastructure.Persistence;

/// <summary>
/// AppDbContext implements IUnitOfWork directly — this adapter is
/// registered so services can depend on IUnitOfWork without knowing EF.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    public UnitOfWork(AppDbContext context) => _context = context;
    public Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        _context.SaveChangesAsync(ct);
}

namespace FoodDelivery.Application.Common.Interfaces;

/// <summary>
/// Abstracts the EF Core SaveChanges so services stay decoupled from EF.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

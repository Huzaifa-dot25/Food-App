using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace FoodDelivery.Infrastructure.Persistence;

/// <summary>
/// Extension helpers for EF Core queries — pagination, projection,
/// and performance patterns.
/// </summary>
public static class QueryExtensions
{
    // ── Pagination ────────────────────────────────────────────────

    /// <summary>
    /// Apply skip/take pagination and return both items and total count
    /// in a single round-trip using two queries (count + data).
    /// </summary>
    public static async Task<(List<T> Items, int TotalCount)> ToPagedListAsync<T>(
        this IQueryable<T> query,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    // ── Conditional filtering ─────────────────────────────────────

    /// <summary>
    /// Apply a <paramref name="predicate"/> only when <paramref name="condition"/> is true.
    /// Keeps query chains readable without if-blocks.
    /// </summary>
    public static IQueryable<T> WhereIf<T>(
        this IQueryable<T> query,
        bool condition,
        Expression<Func<T, bool>> predicate)
        => condition ? query.Where(predicate) : query;

    // ── No-tracking for read-only queries ─────────────────────────

    /// <summary>
    /// Use AsNoTracking with identity resolution disabled for best
    /// read-only performance.
    /// </summary>
    public static IQueryable<T> AsReadOnly<T>(this IQueryable<T> query)
        where T : class
        => query.AsNoTrackingWithIdentityResolution();

    // ── Soft projection helpers ───────────────────────────────────

    /// <summary>
    /// Check existence efficiently without loading any data.
    /// </summary>
    public static Task<bool> ExistsAsync<T>(
        this IQueryable<T> query,
        Expression<Func<T, bool>> predicate,
        CancellationToken ct = default)
        => query.AnyAsync(predicate, ct);
}

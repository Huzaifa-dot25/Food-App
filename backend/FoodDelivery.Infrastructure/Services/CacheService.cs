using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace FoodDelivery.Infrastructure.Services;

/// <summary>
/// Generic in-memory cache wrapper with automatic expiry and
/// typed get-or-create pattern.
/// Swap backing store for IDistributedCache (Redis) in production.
/// </summary>
public class CacheService
{
    private readonly IMemoryCache             _cache;
    private readonly ILogger<CacheService>    _logger;

    // Default TTLs
    public static readonly TimeSpan Short  = TimeSpan.FromMinutes(2);
    public static readonly TimeSpan Medium = TimeSpan.FromMinutes(10);
    public static readonly TimeSpan Long   = TimeSpan.FromMinutes(30);

    public CacheService(IMemoryCache cache, ILogger<CacheService> logger)
    {
        _cache  = cache;
        _logger = logger;
    }

    /// <summary>
    /// Return cached value or execute <paramref name="factory"/> and cache the result.
    /// </summary>
    public async Task<T> GetOrCreateAsync<T>(
        string key,
        Func<Task<T>> factory,
        TimeSpan? ttl = null)
    {
        if (_cache.TryGetValue(key, out T? cached) && cached is not null)
        {
            _logger.LogDebug("Cache HIT: {Key}", key);
            return cached;
        }

        _logger.LogDebug("Cache MISS: {Key}", key);
        var result = await factory();

        _cache.Set(key, result, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = ttl ?? Medium,
            SlidingExpiration               = null,
            Priority                        = CacheItemPriority.Normal,
        });

        return result;
    }

    /// <summary>Invalidate a specific cache entry.</summary>
    public void Remove(string key)
    {
        _cache.Remove(key);
        _logger.LogDebug("Cache REMOVE: {Key}", key);
    }

    /// <summary>Invalidate all keys matching a prefix pattern.</summary>
    public void RemoveByPrefix(string prefix)
    {
        // MemoryCache doesn't support pattern removal natively.
        // Track keys manually via the CacheKeyRegistry below.
        CacheKeyRegistry.RemoveByPrefix(prefix, key => _cache.Remove(key));
        _logger.LogDebug("Cache REMOVE prefix: {Prefix}", prefix);
    }

    // ── Cache Key Helpers ─────────────────────────────────────────

    public static class Keys
    {
        public static string RestaurantCategories()          => "restaurant:categories";
        public static string RestaurantById(int id)          => $"restaurant:{id}";
        public static string FeaturedRestaurants()           => "restaurant:featured";
        public static string NearbyRestaurants(double lat, double lng, double r)
            => $"restaurant:nearby:{lat:F3}:{lng:F3}:{r}";
        public static string FoodById(int id)                => $"food:{id}";
        public static string FoodsByRestaurant(int restId, int? catId = null)
            => $"food:restaurant:{restId}:{catId ?? 0}";
        public static string BestSellers(int restId)         => $"food:bestsellers:{restId}";
        public static string Popular(int restId)             => $"food:popular:{restId}";
        public static string Recommended(int restId)         => $"food:recommended:{restId}";
        public static string FoodCategories(int restId)      => $"food:categories:{restId}";
        public static string UnreadCount(int userId)         => $"notif:unread:{userId}";
    }
}

/// <summary>
/// Simple in-process registry to enable prefix-based cache invalidation.
/// </summary>
internal static class CacheKeyRegistry
{
    private static readonly HashSet<string> _keys = new();
    private static readonly object _lock = new();

    public static void Register(string key)
    {
        lock (_lock) { _keys.Add(key); }
    }

    public static void RemoveByPrefix(string prefix, Action<string> removeAction)
    {
        lock (_lock)
        {
            var matching = _keys.Where(k => k.StartsWith(prefix)).ToList();
            foreach (var key in matching)
            {
                removeAction(key);
                _keys.Remove(key);
            }
        }
    }
}

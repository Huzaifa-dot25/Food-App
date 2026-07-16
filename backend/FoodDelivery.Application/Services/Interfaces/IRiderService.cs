using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Rider;

namespace FoodDelivery.Application.Services.Interfaces;

public interface IRiderService
{
    Task<RiderDto> RegisterAsync(int userId, RiderRegistrationRequest request);
    Task<RiderDto> GetProfileAsync(int riderId);
    Task<RiderDto> UpdateLocationAsync(int riderId, UpdateRiderLocationRequest request);
    Task<RiderDto> ToggleAvailabilityAsync(int riderId);

    // Admin
    Task<PagedResult<RiderDto>> GetAllAsync(PaginationRequest pagination, string? status = null);
    Task<RiderDto> ApproveAsync(int riderId);
    Task<RiderDto> SuspendAsync(int riderId, string reason);
}

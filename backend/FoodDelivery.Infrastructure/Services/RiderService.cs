using AutoMapper;
using FoodDelivery.Application.Common.Models;
using FoodDelivery.Application.DTOs.Rider;
using FoodDelivery.Application.Services.Interfaces;
using FoodDelivery.Domain.Entities;
using FoodDelivery.Domain.Enums;
using FoodDelivery.Domain.Exceptions;
using FoodDelivery.Infrastructure.Persistence;
using FoodDelivery.Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodDelivery.Infrastructure.Services;

public class RiderService : IRiderService
{
    private readonly IRiderRepository _riderRepo;
    private readonly AppDbContext     _context;
    private readonly IMapper          _mapper;

    public RiderService(IRiderRepository riderRepo, AppDbContext context, IMapper mapper)
    {
        _riderRepo = riderRepo;
        _context   = context;
        _mapper    = mapper;
    }

    public async Task<RiderDto> RegisterAsync(int userId, RiderRegistrationRequest request)
    {
        var existing = await _riderRepo.GetByUserIdAsync(userId);
        if (existing != null)
            throw new DomainException("You already have a rider profile.");

        if (!Enum.TryParse<VehicleType>(request.VehicleType, true, out var vehicleType))
            throw new Domain.Exceptions.ValidationException("VehicleType", "Invalid vehicle type.");

        var rider = new Rider
        {
            UserId       = userId,
            VehicleType  = vehicleType,
            VehiclePlate = request.VehiclePlate,
            LicenseNumber = request.LicenseNumber,
            Status       = RiderStatus.PendingApproval,
            IsAvailable  = false
        };

        await _riderRepo.AddAsync(rider);
        await _context.SaveChangesAsync();

        return _mapper.Map<RiderDto>(
            await _riderRepo.GetWithDetailsAsync(rider.Id));
    }

    public async Task<RiderDto> GetProfileAsync(int riderId)
    {
        var rider = await _riderRepo.GetWithDetailsAsync(riderId)
            ?? throw new NotFoundException("Rider", riderId);
        return _mapper.Map<RiderDto>(rider);
    }

    public async Task<RiderDto> UpdateLocationAsync(int riderId, UpdateRiderLocationRequest request)
    {
        var rider = await _riderRepo.GetByIdAsync(riderId)
            ?? throw new NotFoundException("Rider", riderId);

        rider.CurrentLatitude  = request.Latitude;
        rider.CurrentLongitude = request.Longitude;
        await _context.SaveChangesAsync();

        return _mapper.Map<RiderDto>(await _riderRepo.GetWithDetailsAsync(riderId));
    }

    public async Task<RiderDto> ToggleAvailabilityAsync(int riderId)
    {
        var rider = await _riderRepo.GetByIdAsync(riderId)
            ?? throw new NotFoundException("Rider", riderId);

        if (rider.Status != RiderStatus.Active)
            throw new DomainException("Your account must be active to toggle availability.");

        rider.IsAvailable = !rider.IsAvailable;
        await _context.SaveChangesAsync();

        return _mapper.Map<RiderDto>(await _riderRepo.GetWithDetailsAsync(riderId));
    }

    public async Task<PagedResult<RiderDto>> GetAllAsync(
        PaginationRequest pagination, string? status = null)
    {
        var (items, total) = await _riderRepo.GetAllAsync(
            pagination.PageNumber, pagination.PageSize, status);
        return PagedResult<RiderDto>.Create(
            _mapper.Map<IReadOnlyList<RiderDto>>(items),
            total, pagination.PageNumber, pagination.PageSize);
    }

    public async Task<RiderDto> ApproveAsync(int riderId)
    {
        var rider = await _riderRepo.GetByIdAsync(riderId)
            ?? throw new NotFoundException("Rider", riderId);
        rider.Status = RiderStatus.Active;
        await _context.SaveChangesAsync();
        return _mapper.Map<RiderDto>(await _riderRepo.GetWithDetailsAsync(riderId));
    }

    public async Task<RiderDto> SuspendAsync(int riderId, string reason)
    {
        var rider = await _riderRepo.GetByIdAsync(riderId)
            ?? throw new NotFoundException("Rider", riderId);
        rider.Status      = RiderStatus.Suspended;
        rider.IsAvailable = false;
        await _context.SaveChangesAsync();
        return _mapper.Map<RiderDto>(await _riderRepo.GetWithDetailsAsync(riderId));
    }
}

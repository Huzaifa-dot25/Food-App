using AutoMapper;
using FoodDelivery.Application.DTOs.Admin;
using FoodDelivery.Application.DTOs.Auth;
using FoodDelivery.Application.DTOs.Cart;
using FoodDelivery.Application.DTOs.Food;
using FoodDelivery.Application.DTOs.Notification;
using FoodDelivery.Application.DTOs.Order;
using FoodDelivery.Application.DTOs.Payment;
using FoodDelivery.Application.DTOs.Restaurant;
using FoodDelivery.Application.DTOs.Review;
using FoodDelivery.Application.DTOs.Rider;
using FoodDelivery.Domain.Entities;

namespace FoodDelivery.Application.Common.Mappings;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        // ── User / Auth ────────────────────────────────────────────────
        CreateMap<User, UserProfileDto>()
            .ForMember(d => d.Roles,
                opt => opt.MapFrom(s => s.UserRoles.Select(ur => ur.Role.Name).ToList()));

        CreateMap<Address, AddressDto>();
        CreateMap<CreateAddressRequest, Address>();

        // ── Restaurant ─────────────────────────────────────────────────
        CreateMap<Restaurant, RestaurantSummaryDto>()
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.IsFavorite,   opt => opt.Ignore())   // set per-request in service
            .ForMember(d => d.DistanceKm,   opt => opt.Ignore());  // calculated in service

        CreateMap<Restaurant, RestaurantDto>()
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.CategoryIcon, opt => opt.MapFrom(s => s.Category.IconUrl))
            .ForMember(d => d.DistanceKm,   opt => opt.Ignore())
            .ForMember(d => d.BusinessHours,opt => opt.MapFrom(s => s.BusinessHours));

        CreateMap<BusinessHour, BusinessHourDto>()
            .ForMember(d => d.DayName,    opt => opt.MapFrom(s => ((DayOfWeek)s.DayOfWeek).ToString()))
            .ForMember(d => d.OpenTime,   opt => opt.MapFrom(s => s.OpenTime.ToString("HH:mm")))
            .ForMember(d => d.CloseTime,  opt => opt.MapFrom(s => s.CloseTime.ToString("HH:mm")));

        CreateMap<CreateRestaurantRequest, Restaurant>()
            .ForMember(d => d.BusinessHours, opt => opt.Ignore()); // handled manually in service

        // ── Food ───────────────────────────────────────────────────────
        CreateMap<Food, FoodDto>()
            .ForMember(d => d.CategoryName,    opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.RestaurantName,  opt => opt.MapFrom(s => s.Restaurant.Name))
            .ForMember(d => d.EffectivePrice,  opt => opt.MapFrom(s => s.EffectivePrice))
            .ForMember(d => d.PrimaryImageUrl, opt => opt.MapFrom(
                s => s.Images.FirstOrDefault(i => i.IsPrimary) != null
                    ? s.Images.First(i => i.IsPrimary).ImageUrl
                    : s.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault()));

        CreateMap<Food, FoodSummaryDto>()
            .ForMember(d => d.EffectivePrice,  opt => opt.MapFrom(s => s.EffectivePrice))
            .ForMember(d => d.CategoryName,    opt => opt.MapFrom(s => s.Category.Name))
            .ForMember(d => d.PrimaryImageUrl, opt => opt.MapFrom(
                s => s.Images.FirstOrDefault(i => i.IsPrimary) != null
                    ? s.Images.First(i => i.IsPrimary).ImageUrl
                    : s.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault()));

        CreateMap<FoodImage, FoodImageDto>();
        CreateMap<FoodCategory, FoodCategoryDto>()
            .ForMember(d => d.FoodCount, opt => opt.MapFrom(s => s.Foods.Count));
        CreateMap<CreateFoodRequest, Food>();
        CreateMap<CreateFoodCategoryRequest, FoodCategory>();

        // ── Cart ───────────────────────────────────────────────────────
        CreateMap<CartItem, CartItemDto>()
            .ForMember(d => d.FoodName,     opt => opt.MapFrom(s => s.Food.Name))
            .ForMember(d => d.FoodImageUrl, opt => opt.MapFrom(
                s => s.Food.Images.FirstOrDefault(i => i.IsPrimary) != null
                    ? s.Food.Images.First(i => i.IsPrimary).ImageUrl
                    : s.Food.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault()))
            .ForMember(d => d.IsAvailable,  opt => opt.MapFrom(s => s.Food.IsAvailable));

        CreateMap<Cart, CartDto>()
            .ForMember(d => d.RestaurantName,    opt => opt.MapFrom(s => s.Restaurant != null ? s.Restaurant.Name : null))
            .ForMember(d => d.RestaurantLogoUrl, opt => opt.MapFrom(s => s.Restaurant != null ? s.Restaurant.LogoImageUrl : null))
            .ForMember(d => d.CouponCode,        opt => opt.MapFrom(s => s.Coupon != null ? s.Coupon.Code : null))
            .ForMember(d => d.Subtotal,          opt => opt.MapFrom(s => s.Subtotal))
            .ForMember(d => d.ItemCount,         opt => opt.MapFrom(s => s.Items.Sum(i => i.Quantity)))
            .ForMember(d => d.DeliveryFee,       opt => opt.Ignore())   // set in service (from restaurant)
            .ForMember(d => d.Total,             opt => opt.Ignore())   // set in service
            .ForMember(d => d.DiscountAmount,    opt => opt.Ignore());  // set in service

        // ── Order ──────────────────────────────────────────────────────
        CreateMap<Order, OrderSummaryDto>()
            .ForMember(d => d.RestaurantName, opt => opt.MapFrom(s => s.Restaurant.Name))
            .ForMember(d => d.RestaurantLogo, opt => opt.MapFrom(s => s.Restaurant.LogoImageUrl))
            .ForMember(d => d.Status,         opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.ItemCount,      opt => opt.MapFrom(s => s.Items.Sum(i => i.Quantity)))
            .ForMember(d => d.PaymentMethod,  opt => opt.MapFrom(s => s.PaymentMethod.ToString()));

        CreateMap<Order, OrderDto>()
            .ForMember(d => d.RestaurantName,  opt => opt.MapFrom(s => s.Restaurant.Name))
            .ForMember(d => d.RestaurantLogo,  opt => opt.MapFrom(s => s.Restaurant.LogoImageUrl))
            .ForMember(d => d.Status,          opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.PaymentMethod,   opt => opt.MapFrom(s => s.PaymentMethod.ToString()))
            .ForMember(d => d.PaymentStatus,   opt => opt.MapFrom(s =>
                s.Payment != null ? s.Payment.Status.ToString() : "Pending"))
            .ForMember(d => d.CouponCode,      opt => opt.MapFrom(s =>
                s.Coupon != null ? s.Coupon.Code : null))
            .ForMember(d => d.DeliveryAddress, opt => opt.MapFrom(s =>
                $"{s.Address.Street}, {s.Address.City}, {s.Address.State} {s.Address.ZipCode}"))
            .ForMember(d => d.AddressLatitude,  opt => opt.MapFrom(s => s.Address.Latitude))
            .ForMember(d => d.AddressLongitude, opt => opt.MapFrom(s => s.Address.Longitude))
            .ForMember(d => d.Rider,            opt => opt.MapFrom(s =>
                s.RiderAssignment != null ? s.RiderAssignment.Rider : null))
            .ForMember(d => d.CanCancel, opt => opt.Ignore())   // set in service based on status
            .ForMember(d => d.CanReview, opt => opt.Ignore());  // set in service based on status + review

        CreateMap<OrderItem, OrderItemDto>();

        CreateMap<Rider, RiderTrackingDto>()
            .ForMember(d => d.RiderName,   opt => opt.MapFrom(s => s.User.FullName))
            .ForMember(d => d.RiderPhone,  opt => opt.MapFrom(s => s.User.PhoneNumber))
            .ForMember(d => d.RiderPhoto,  opt => opt.MapFrom(s => s.User.ProfileImageUrl))
            .ForMember(d => d.VehicleType, opt => opt.MapFrom(s => s.VehicleType.ToString()))
            .ForMember(d => d.Latitude,    opt => opt.MapFrom(s => s.CurrentLatitude))
            .ForMember(d => d.Longitude,   opt => opt.MapFrom(s => s.CurrentLongitude));

        // ── Payment ────────────────────────────────────────────────────
        CreateMap<Payment, PaymentDto>()
            .ForMember(d => d.OrderNumber, opt => opt.MapFrom(s => s.Order.OrderNumber))
            .ForMember(d => d.Method,      opt => opt.MapFrom(s => s.Method.ToString()))
            .ForMember(d => d.Status,      opt => opt.MapFrom(s => s.Status.ToString()));

        // ── Review ─────────────────────────────────────────────────────
        CreateMap<Review, ReviewDto>()
            .ForMember(d => d.OrderNumber,    opt => opt.MapFrom(s => s.Order.OrderNumber))
            .ForMember(d => d.CustomerName,   opt => opt.MapFrom(s => s.Customer.FullName))
            .ForMember(d => d.CustomerPhoto,  opt => opt.MapFrom(s => s.Customer.ProfileImageUrl));

        // ── Rider ──────────────────────────────────────────────────────
        CreateMap<Rider, RiderDto>()
            .ForMember(d => d.FullName,        opt => opt.MapFrom(s => s.User.FullName))
            .ForMember(d => d.Email,           opt => opt.MapFrom(s => s.User.Email))
            .ForMember(d => d.PhoneNumber,     opt => opt.MapFrom(s => s.User.PhoneNumber))
            .ForMember(d => d.ProfileImageUrl, opt => opt.MapFrom(s => s.User.ProfileImageUrl))
            .ForMember(d => d.VehicleType,     opt => opt.MapFrom(s => s.VehicleType.ToString()))
            .ForMember(d => d.Status,          opt => opt.MapFrom(s => s.Status.ToString()));

        CreateMap<RiderAssignment, RiderDeliveryDto>()
            .ForMember(d => d.AssignmentId,        opt => opt.MapFrom(s => s.Id))
            .ForMember(d => d.OrderNumber,         opt => opt.MapFrom(s => s.Order.OrderNumber))
            .ForMember(d => d.RestaurantName,      opt => opt.MapFrom(s => s.Order.Restaurant.Name))
            .ForMember(d => d.RestaurantAddress,   opt => opt.MapFrom(s =>
                $"{s.Order.Restaurant.Street}, {s.Order.Restaurant.City}"))
            .ForMember(d => d.RestaurantLatitude,  opt => opt.MapFrom(s => s.Order.Restaurant.Latitude))
            .ForMember(d => d.RestaurantLongitude, opt => opt.MapFrom(s => s.Order.Restaurant.Longitude))
            .ForMember(d => d.CustomerName,        opt => opt.MapFrom(s => s.Order.Customer.FullName))
            .ForMember(d => d.DeliveryAddress,     opt => opt.MapFrom(s =>
                $"{s.Order.Address.Street}, {s.Order.Address.City}"))
            .ForMember(d => d.DeliveryLatitude,    opt => opt.MapFrom(s => s.Order.Address.Latitude))
            .ForMember(d => d.DeliveryLongitude,   opt => opt.MapFrom(s => s.Order.Address.Longitude))
            .ForMember(d => d.DeliveryInstructions,opt => opt.MapFrom(s => s.Order.DeliveryInstructions))
            .ForMember(d => d.TotalAmount,         opt => opt.MapFrom(s => s.Order.TotalAmount))
            .ForMember(d => d.PaymentMethod,       opt => opt.MapFrom(s => s.Order.PaymentMethod.ToString()));

        // ── Notification ───────────────────────────────────────────────
        CreateMap<Notification, NotificationDto>()
            .ForMember(d => d.Type, opt => opt.MapFrom(s => s.Type.ToString()));

        // ── Admin ──────────────────────────────────────────────────────
        CreateMap<User, AdminUserDto>()
            .ForMember(d => d.FullName, opt => opt.MapFrom(s => s.FullName))
            .ForMember(d => d.Status,   opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.Roles,    opt => opt.MapFrom(s =>
                s.UserRoles.Select(ur => ur.Role.Name).ToList()));

        CreateMap<Restaurant, AdminRestaurantDto>()
            .ForMember(d => d.OwnerName,  opt => opt.MapFrom(s => s.Owner.FullName))
            .ForMember(d => d.OwnerEmail, opt => opt.MapFrom(s => s.Owner.Email))
            .ForMember(d => d.Status,     opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.TotalOrders,opt => opt.MapFrom(s => s.Orders.Count))
            .ForMember(d => d.TotalRevenue, opt => opt.MapFrom(s =>
                s.Orders.Where(o => o.Status == Domain.Enums.OrderStatus.Delivered)
                        .Sum(o => o.TotalAmount)));
    }
}

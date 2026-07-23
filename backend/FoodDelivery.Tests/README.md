# FoodDelivery.Tests

## Running Tests

```bash
# From backend root — run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test class
dotnet test --filter "FullyQualifiedName~AuthServiceTests"

# Run only unit tests
dotnet test --filter "FullyQualifiedName~Unit"

# Run only integration tests
dotnet test --filter "FullyQualifiedName~Integration"
```

## Test Projects

### Unit Tests (`Unit/`)

| File | What it tests |
|------|---------------|
| `AuthServiceTests.cs`   | Register, Login, OTP verify, password reset, JWT generation |
| `CartServiceTests.cs`   | Add item, unavailable food, cross-restaurant guard |
| `OrderServiceTests.cs`  | Cancel (valid/invalid statuses), unauthorized cancel |
| `ValidatorTests.cs`     | FluentValidation rules for all DTOs |
| `GeoServiceTests.cs`    | Haversine distance calculation, known coordinates |
| `DomainEntityTests.cs`  | Food.EffectivePrice, Coupon.IsValid, Cart.Subtotal, CartItem.TotalPrice |

### Integration Tests (`Integration/`)

| File | What it tests |
|------|---------------|
| `AuthControllerIntegrationTests.cs` | Full HTTP pipeline: register, login, auth errors, health check, rate limiting |

## Test Architecture

- **xUnit** — test runner
- **Moq** — mocking repositories and external services
- **FluentAssertions** — readable assertion API
- **EF Core InMemory** — database for unit and integration tests
- **WebApplicationFactory** — spins up real ASP.NET Core pipeline for integration tests

## Coverage Targets

| Layer | Target |
|-------|--------|
| Domain Entities | 100% |
| Validators | 95% |
| Application Services | 70% |
| Controllers (via integration) | 60% |

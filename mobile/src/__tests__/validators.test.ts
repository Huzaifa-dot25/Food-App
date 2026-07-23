import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  otpSchema,
  addressSchema,
  reviewSchema,
} from '../utils/validators';

// ── Login Schema ───────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'Test@1234' });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'Test@1234' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: 'Test@1234' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: '' });
    expect(result.success).toBe(false);
  });
});

// ── Register Schema ────────────────────────────────────────────────

describe('registerSchema', () => {
  const validData = {
    firstName:       'John',
    lastName:        'Doe',
    email:           'john@test.com',
    phoneNumber:     '+1234567890',
    password:        'Test@1234',
    confirmPassword: 'Test@1234',
    role:            'Customer' as const,
  };

  it('accepts valid registration data', () => {
    expect(registerSchema.safeParse(validData).success).toBe(true);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ ...validData, password: 'Ab1!', confirmPassword: 'Ab1!' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const pwdError = result.error.issues.find(i => i.path[0] === 'password');
      expect(pwdError).toBeDefined();
    }
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'Test@1234',
      confirmPassword: 'Different@1234',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'test@1234',
      confirmPassword: 'test@1234',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without special character', () => {
    const result = registerSchema.safeParse({
      ...validData,
      password: 'TestPass1',
      confirmPassword: 'TestPass1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const result = registerSchema.safeParse({ ...validData, role: 'Admin' });
    expect(result.success).toBe(false);
  });

  it('accepts Owner and Rider roles', () => {
    expect(registerSchema.safeParse({ ...validData, role: 'Owner' }).success).toBe(true);
    expect(registerSchema.safeParse({ ...validData, role: 'Rider' }).success).toBe(true);
  });
});

// ── OTP Schema ─────────────────────────────────────────────────────

describe('otpSchema', () => {
  it('accepts valid 6-digit OTP', () => {
    const result = otpSchema.safeParse({ email: 'a@b.com', otpCode: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects 5-digit OTP', () => {
    const result = otpSchema.safeParse({ email: 'a@b.com', otpCode: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric OTP', () => {
    const result = otpSchema.safeParse({ email: 'a@b.com', otpCode: '12345A' });
    expect(result.success).toBe(false);
  });
});

// ── Address Schema ─────────────────────────────────────────────────

describe('addressSchema', () => {
  it('accepts valid address', () => {
    const result = addressSchema.safeParse({
      label:   'Home',
      street:  '123 Main St',
      city:    'Karachi',
      state:   'Sindh',
      zipCode: '74000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty street', () => {
    const result = addressSchema.safeParse({
      label: 'Home', street: '', city: 'Karachi', state: 'Sindh', zipCode: '74000',
    });
    expect(result.success).toBe(false);
  });
});

// ── Review Schema ──────────────────────────────────────────────────

describe('reviewSchema', () => {
  it('accepts rating 1 to 5', () => {
    for (const r of [1, 2, 3, 4, 5]) {
      expect(reviewSchema.safeParse({ rating: r }).success).toBe(true);
    }
  });

  it('rejects rating 0', () => {
    expect(reviewSchema.safeParse({ rating: 0 }).success).toBe(false);
  });

  it('rejects rating 6', () => {
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it('accepts optional comment', () => {
    const result = reviewSchema.safeParse({ rating: 4, comment: 'Great food!' });
    expect(result.success).toBe(true);
  });

  it('rejects comment over 1000 characters', () => {
    const result = reviewSchema.safeParse({ rating: 4, comment: 'x'.repeat(1001) });
    expect(result.success).toBe(false);
  });
});

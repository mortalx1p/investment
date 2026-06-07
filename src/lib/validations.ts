// src/lib/validations.ts
import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2).max(50).regex(/^[a-zA-Z\s]+$/, 'Only letters allowed'),
  lastName: z.string().min(2).max(50).regex(/^[a-zA-Z\s]+$/, 'Only letters allowed'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  phone: z.string().optional(),
  country: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
});

export const depositSchema = z.object({
  coin: z.enum(['BTC', 'ETH', 'USDT_TRC20', 'USDT_ERC20', 'BNB']),
  amount: z.number().min(1, 'Minimum deposit is $1'),
  txHash: z.string().min(10, 'Enter a valid transaction hash'),
});

export const withdrawalSchema = z.object({
  coin: z.enum(['BTC', 'ETH', 'USDT_TRC20', 'USDT_ERC20', 'BNB']),
  amount: z.number().min(50, 'Minimum withdrawal is $50'),
  walletAddress: z.string().min(20, 'Enter a valid wallet address'),
});

export const investmentSchema = z.object({
  planId: z.string().cuid(),
  amount: z.number().min(1),
});

export const walletAddressSchema = z.object({
  coin: z.enum(['BTC', 'ETH', 'USDT_TRC20', 'USDT_ERC20', 'BNB']),
  address: z.string().min(20, 'Enter a valid wallet address'),
  network: z.string().min(2),
});

export const investmentPlanSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  minDeposit: z.number().min(1),
  maxDeposit: z.number().min(1),
  durationDays: z.number().int().min(1),
  estimatedReturn: z.number().min(0).max(1000),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']),
  features: z.array(z.string()),
  featured: z.boolean().optional(),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
});

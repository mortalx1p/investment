// prisma/seed.ts
import { PrismaClient, RiskLevel, CoinType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cryptovault.com' },
    update: {},
    create: {
      email: 'admin@cryptovault.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  console.log('Admin created:', admin.email);

  // Create default wallet addresses
  const wallets = [
    { coin: CoinType.BTC, address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf', network: 'Bitcoin Network' },
    { coin: CoinType.ETH, address: '0x742d35Cc6634C0532925a3b8D4C9B9d5b8C7B4e1', network: 'Ethereum Network' },
    { coin: CoinType.USDT_TRC20, address: 'TQn9Y2khDD95J9nJsLTcGxHLK5Qgdmk4z', network: 'TRON Network (TRC20)' },
    { coin: CoinType.USDT_ERC20, address: '0x742d35Cc6634C0532925a3b8D4C9B9d5b8C7B4e2', network: 'Ethereum Network (ERC20)' },
    { coin: CoinType.BNB, address: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2', network: 'BNB Smart Chain' },
  ];

  for (const wallet of wallets) {
    await prisma.walletAddress.upsert({
      where: { coin: wallet.coin },
      update: {},
      create: wallet,
    });
  }

  // Create investment plans
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for beginners entering the crypto market with small capital.',
      minDeposit: 100,
      maxDeposit: 999,
      durationDays: 30,
      estimatedReturn: 8,
      riskLevel: RiskLevel.LOW,
      features: ['Portfolio Diversification', 'Weekly Reports', 'Email Support', 'Basic Analytics'],
    },
    {
      name: 'Growth',
      description: 'Balanced exposure to crypto markets for steady portfolio growth.',
      minDeposit: 1000,
      maxDeposit: 4999,
      durationDays: 60,
      estimatedReturn: 18,
      riskLevel: RiskLevel.MEDIUM,
      featured: true,
      features: ['Diversified Portfolio', 'Daily Reports', 'Priority Support', 'Advanced Analytics', 'Market Alerts'],
    },
    {
      name: 'Premium',
      description: 'High-exposure strategies for experienced investors seeking larger potential returns.',
      minDeposit: 5000,
      maxDeposit: 24999,
      durationDays: 90,
      estimatedReturn: 35,
      riskLevel: RiskLevel.HIGH,
      features: ['Active Management', 'Real-time Reports', 'Dedicated Manager', 'Pro Analytics', 'DeFi Access', 'NFT Strategy'],
    },
    {
      name: 'Elite',
      description: 'Institutional-grade strategies for high-net-worth investors.',
      minDeposit: 25000,
      maxDeposit: 1000000,
      durationDays: 180,
      estimatedReturn: 65,
      riskLevel: RiskLevel.VERY_HIGH,
      features: ['Custom Portfolio', 'Live Dashboard', 'Personal Advisor', 'Quant Strategies', 'Early Access', 'VIP Events', 'Tax Optimization'],
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.investmentPlan.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.investmentPlan.create({ data: plan });
    }
  }

  // Create admin settings
  const settings = [
    { key: 'site_name', value: 'CryptoVault', label: 'Site Name' },
    { key: 'site_email', value: 'admin@cryptovault.com', label: 'Site Email' },
    { key: 'min_withdrawal', value: '50', label: 'Minimum Withdrawal (USD)' },
    { key: 'withdrawal_fee', value: '2.5', label: 'Withdrawal Fee (%)' },
    { key: 'maintenance_mode', value: 'false', label: 'Maintenance Mode' },
  ];

  for (const setting of settings) {
    await prisma.adminSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: { ...setting, updatedAt: new Date() },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

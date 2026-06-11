import { PrismaClient, PaymentMethod, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding initial providers...');

  const providers = [
    {
      name: 'airtel',
      method: PaymentMethod.AIRTEL_MONEY,
      priority: 1,
      weight: 100,
      credentials: { clientSecret: 'airtel_mock_secret', clientId: 'airtel_client_id' },
    },
    {
      name: 'moov',
      method: PaymentMethod.MOOV_MONEY,
      priority: 1,
      weight: 100,
      credentials: { secretKey: 'moov_mock_secret', appId: 'moov_app_id' },
    },
    {
      name: 'orange',
      method: PaymentMethod.ORANGE_MONEY,
      priority: 1,
      weight: 100,
      credentials: { merchantKey: 'orange_mock_secret', authHeader: 'orange_auth_val' },
    },
    {
      name: 'visa',
      method: PaymentMethod.VISA,
      priority: 1,
      weight: 50,
      credentials: { sharedSecret: 'visa_mock_secret', merchantId: 'visa_merchant_id' },
    },
    {
      name: 'mastercard',
      method: PaymentMethod.MASTERCARD,
      priority: 1,
      weight: 50,
      credentials: { sharedSecret: 'mastercard_mock_secret', merchantId: 'mc_merchant_id' },
    },
  ];

  for (const prov of providers) {
    await prisma.provider.upsert({
      where: { name: prov.name },
      update: {
        priority: prov.priority,
        weight: prov.weight,
        credentials: prov.credentials,
      },
      create: prov,
    });
  }

  console.log('✅ Providers successfully seeded.');

  // Seed a default system Super Admin
  console.log('🚀 Seeding administrative user...');
  const passwordHash = await bcrypt.hash('AdminInnovPay2026!', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@innovpay.com' },
    update: {},
    create: {
      email: 'admin@innovpay.com',
      name: 'Innov Pay Administrator',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Admin user successfully seeded.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

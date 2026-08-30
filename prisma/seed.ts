import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.exit.deleteMany();
  await prisma.outcome.deleteMany();
  await prisma.learning.deleteMany();
  await prisma.signalTrace.deleteMany();
  await prisma.signal.deleteMany();
  await prisma.decisionTrace.deleteMany();
  await prisma.fill.deleteMany();
  await prisma.order.deleteMany();
  await prisma.position.deleteMany();
  await prisma.candle.deleteMany();
  await prisma.paperAccount.deleteMany();
  await prisma.market.deleteMany();

  // Create markets
  const markets = [
    {
      symbol: 'BTCUSDT',
      baseAsset: 'BTC',
      quoteAsset: 'USDT',
      minPrice: 0.01,
      maxPrice: 1000000,
      pricePrecision: 2,
      quantityPrecision: 8,
      minNotional: 10,
    },
    {
      symbol: 'ETHUSDT',
      baseAsset: 'ETH',
      quoteAsset: 'USDT',
      minPrice: 0.01,
      maxPrice: 1000000,
      pricePrecision: 2,
      quantityPrecision: 8,
      minNotional: 10,
    },
    {
      symbol: 'BNBUSDT',
      baseAsset: 'BNB',
      quoteAsset: 'USDT',
      minPrice: 0.01,
      maxPrice: 1000000,
      pricePrecision: 2,
      quantityPrecision: 8,
      minNotional: 10,
    },
    {
      symbol: 'ADAUSDT',
      baseAsset: 'ADA',
      quoteAsset: 'USDT',
      minPrice: 0.0001,
      maxPrice: 1000000,
      pricePrecision: 4,
      quantityPrecision: 8,
      minNotional: 10,
    },
    {
      symbol: 'SOLUSDT',
      baseAsset: 'SOL',
      quoteAsset: 'USDT',
      minPrice: 0.01,
      maxPrice: 1000000,
      pricePrecision: 2,
      quantityPrecision: 8,
      minNotional: 10,
    },
  ];

  for (const market of markets) {
    await prisma.market.create({ data: market });
    console.log(`✅ Created market: ${market.symbol}`);
  }

  // Create paper accounts
  const account = await prisma.paperAccount.create({
    data: {
      name: 'Demo Account',
      balance: 10000,
      usedMargin: 0,
      availableMargin: 10000,
    },
  });
  console.log(`✅ Created account: ${account.name}`);

  // Create sample candles
  const now = new Date();
  for (const market of markets) {
    for (let i = 0; i < 24; i++) {
      const openTime = new Date(now.getTime() - (24 - i) * 3600000);
      const closeTime = new Date(openTime.getTime() + 3600000);
      const basePrice = Math.random() * 50000 + 25000;

      await prisma.candle.create({
        data: {
          symbol: market.symbol,
          timeframe: '1h',
          openTime,
          closeTime,
          open: basePrice,
          high: basePrice * 1.02,
          low: basePrice * 0.98,
          close: basePrice * 1.01,
          volume: Math.random() * 1000000 + 100000,
          quoteVolume: Math.random() * 50000000 + 5000000,
          trades: Math.floor(Math.random() * 1000 + 100),
          takerBuyVolume: Math.random() * 500000 + 50000,
          takerBuyQuoteVolume: Math.random() * 25000000 + 2500000,
        },
      });
    }
    console.log(`✅ Created 24 candles for ${market.symbol}`);
  }

  console.log('🌱 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('🔥 Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import { Order, Position } from '../domain/types';

export class OrderExecutor {
  constructor(private prisma: PrismaClient) {}

  async createOrder(
    accountId: string,
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: number,
    price: number,
    orderType: string = 'LIMIT'
  ): Promise<Order> {
    const market = await this.prisma.market.findUnique({ where: { symbol } });
    if (!market) throw new Error(`Market ${symbol} not found`);

    const order = await this.prisma.order.create({
      data: {
        symbol,
        accountId,
        side,
        quantity,
        price,
        orderType,
        status: 'PENDING',
      },
    });

    return order as Order;
  }

  async fillOrder(orderId: string, fillPrice: number, fillQuantity: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    const filledQuantity = (order.filledQuantity || 0) + fillQuantity;
    const status = filledQuantity >= order.quantity ? 'FILLED' : 'PARTIALLY_FILLED';

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        filledQuantity,
        filledPrice: fillPrice,
        status,
        filledAt: new Date(),
      },
    });

    // Create fill record
    await this.prisma.fill.create({
      data: {
        orderId,
        accountId: order.accountId,
        quantity: fillQuantity,
        price: fillPrice,
        commission: fillQuantity * fillPrice * 0.0004, // 0.04% commission
      },
    });

    return updatedOrder as Order;
  }

  async openPosition(
    accountId: string,
    symbol: string,
    side: 'LONG' | 'SHORT',
    quantity: number,
    entryPrice: number,
    leverage: number = 1
  ): Promise<Position> {
    // Close any existing position in same symbol
    await this.closeExistingPosition(accountId, symbol);

    const marginUsed = (quantity * entryPrice) / leverage;

    const position = await this.prisma.position.create({
      data: {
        symbol,
        accountId,
        side,
        quantity,
        entryPrice,
        currentPrice: entryPrice,
        leverage,
        marginUsed,
        unrealizedPnL: 0,
        status: 'OPEN',
      },
    });

    return position as Position;
  }

  async updatePositionPrice(positionId: string, currentPrice: number): Promise<Position> {
    const position = await this.prisma.position.findUnique({ where: { id: positionId } });
    if (!position) throw new Error('Position not found');

    const priceDiff = position.side === 'LONG' 
      ? currentPrice - position.entryPrice 
      : position.entryPrice - currentPrice;
    
    const unrealizedPnL = priceDiff * position.quantity;

    return await this.prisma.position.update({
      where: { id: positionId },
      data: {
        currentPrice,
        unrealizedPnL,
      },
    }) as Position;
  }

  private async closeExistingPosition(accountId: string, symbol: string): Promise<void> {
    const existing = await this.prisma.position.findFirst({
      where: { accountId, symbol, status: 'OPEN' },
    });

    if (existing) {
      await this.prisma.position.update({
        where: { id: existing.id },
        data: { status: 'CLOSED', closedAt: new Date() },
      });
    }
  }
}

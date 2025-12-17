import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { MailService } from '../mail/mail.service'; // ✅ adjust path as per your project

@Injectable()
export class OrderService {
  private prisma = new PrismaClient();

  constructor(private readonly mailService: MailService) {} // ✅ inject mail service

  async create(createOrderDto: CreateOrderDto) {
    const items = createOrderDto.items;

    if (!items || items.length === 0) {
      throw new BadRequestException('Items are required');
    }

    const productIds = items.map((i) => i.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    let totalAmount = 0;

    const orderItemData = items.map((i) => {
      const p = products.find((x) => x.id === i.productId)!;
      const unitPrice = p.price;
      totalAmount += unitPrice * i.quantity;

      return {
        productId: p.id,
        productName: p.name,
        unitPrice,
        quantity: i.quantity,
      };
    });

    // ✅ no destructure: spread + delete items
    const orderData: any = { ...createOrderDto };
    delete orderData.items;
    orderData.totalAmount = totalAmount;

    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        orderItem: { create: orderItemData },
      },
      include: {
        orderItem: {
          select: {
            productName: true,
            unitPrice: true,
            quantity: true,
          },
        },
      },
    });

    // ✅ Send email (DO NOT block order creation if mail fails)
    try {
      await this.mailService.sendOrderPlacedToUser({
        id: order.id,
        cartId: order.cartId ?? null,
        fullName: order.fullName,
        email: order.email,
        phone: order.phone,
        place: order.place,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        orderItem: order.orderItem,
      });
    } catch (err) {
      // just log - don't throw
      console.error('Order email failed:', err);
    }

    return {
      message: 'Order created successfully',
      order,
    };
  }

  findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { orderItem: { include: { product: true } } },
    });
  }

  findActive() {
    return this.prisma.order.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { orderItem: { include: { product: true } } },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItem: { include: { product: true } } },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id);

    const data: any = { ...updateOrderDto };
    delete data.items;
    delete data.totalAmount;

    const order = await this.prisma.order.update({
      where: { id },
      data: { ...data },
      include: { orderItem: { include: { product: true } } },
    });

    return {
      message: 'Order updated successfully',
      order,
    };
  }

  async remove(id: number) {
    const existing = await this.findOne(id);

    if (!existing.isActive) {
      return {
        message: 'Order already inactive',
        order: existing,
      };
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: { isActive: false },
      include: { orderItem: { include: { product: true } } },
    });

    return {
      message: 'Order marked as inactive',
      order,
    };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  private prisma = new PrismaClient();

  async create(createOrderDto: CreateOrderDto) {
    const { userId, items } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Items are required');
    }

    // ✅ Validate user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // ✅ Fetch products
    const productIds = items.map((i) => i.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    // ✅ Calculate total
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

    // ✅ Create order
    const order = await this.prisma.order.create({
      data: {
        userId,
        fullName: createOrderDto.fullName,
        email: createOrderDto.email ?? "",
        phone: createOrderDto.phone,
        address: createOrderDto.address,
        place: createOrderDto.place,
        pincode: createOrderDto.pincode,
        paymentMethod: createOrderDto.paymentMethod,
        totalAmount,
        orderItem: {
          create: orderItemData,
        },
      },
      include: {
        orderItem: true,
      },
    });

    return {
      message: 'Order created successfully',
      order,
    };
  }

 findAll(userId?: number) {
  return this.prisma.order.findMany({
    where: userId ? { userId } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      orderItem: true,
    },
  });
}

  findActive() {
    return this.prisma.order.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItem: { include: { product: true } },
        user: true,
      },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItem: { include: { product: true } },
        user: true,
      },
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
      data,
      include: {
        orderItem: { include: { product: true } },
      },
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
      include: {
        orderItem: { include: { product: true } },
      },
    });

    return {
      message: 'Order marked as inactive',
      order,
    };
  }

  async findLastByUser(userId: number) {
  const order = await this.prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItem: true,
    },
  });

  if (!order) {
    throw new NotFoundException('No orders found for this user');
  }

  return order;
}
}
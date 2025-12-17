import {
  Controller,
  All,
  Req,
  Res,
  Param,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

 
  @All()
  async handleOrders(@Req() req: Request, @Res() res: Response) {
    const method = req.method;

    if (method === 'POST') {
      const result = await this.orderService.create(req.body);
      return res.json(result);
    }

    if (method === 'GET') {
      const orders = await this.orderService.findAll();
      return res.json(orders);
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  }


  @All('active')
  async handleActive(@Req() req: Request, @Res() res: Response) {
    const method = req.method;

    if (method === 'GET') {
      const orders = await this.orderService.findActive();
      return res.json(orders);
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  }

  
  @All(':id')
  async handleOrderById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const method = req.method;

    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('Invalid id');
    }

    if (method === 'GET') {
      const order = await this.orderService.findOne(id);
      return res.json(order);
    }

    if (method === 'PATCH') {
      const result = await this.orderService.update(id, req.body);
      return res.json(result);
    }

    if (method === 'DELETE') {
      const result = await this.orderService.remove(id);
      return res.json(result);
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}

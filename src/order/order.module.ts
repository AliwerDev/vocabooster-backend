import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderScheme } from '../models/order.scheme';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderScheme }]),
    SharedModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}

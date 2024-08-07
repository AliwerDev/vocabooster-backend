import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OrderModule } from './order/order.module';
import { CardModule } from './card/card.module';
import { BoxModule } from './box/box.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'files') }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    CardModule,
    BoxModule,
    SharedModule,
    AuthModule,
    ProductModule,
    OrderModule,
    UserModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

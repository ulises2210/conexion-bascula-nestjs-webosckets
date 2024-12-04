import { Module } from '@nestjs/common';
import { GatewayModule } from './websockets/websocket.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [GatewayModule, ServicesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

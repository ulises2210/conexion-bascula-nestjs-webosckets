import { Module } from '@nestjs/common';
import { __DirnameService } from './_dirname.service';

@Module({
  providers: [__DirnameService], // Registrar el servicio
  exports: [__DirnameService],
})
export class ServicesModule {}

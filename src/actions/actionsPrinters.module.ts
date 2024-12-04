import { Module } from '@nestjs/common';
import { InstallPrinter } from './installPrinters/installPrinter';
import { ServicesModule } from '../services/services.module';
import { CreatePdf } from './printFiles/createPdf';

@Module({
  imports: [InstallPrinter, ServicesModule, CreatePdf],
  controllers: [],
  providers: [],
})
export class ActionsPrinters {}

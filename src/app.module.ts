import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentifyModule } from './identify/identify.module';

@Module({
  imports: [IdentifyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

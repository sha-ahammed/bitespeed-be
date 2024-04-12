import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentifyModule } from './identify/identify.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // or 'mysql', 'mariadb', 'sqlite', etc.
      host: 'dpg-cock0v0l6cac73f0t2og-a.singapore-postgres.render.com',
      port: 5432,
      username: 'bitespeed_pg_user',
      password: 'XnTf1xN4TlwSGprRwpcGkGRAooHswW3m',
      database: 'bitespeed_pg',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    IdentifyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

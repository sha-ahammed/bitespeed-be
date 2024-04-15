import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentifyModule } from './identify/identify.module';
import * as dotenv from 'dotenv';

interface Credentials {
  host: string;
  username: string;
  password: string;
  database: string;
}

const parsed = {
  host: process.env.host,
  username: process.env.username,
  password: process.env.password,
  database: process.env.password,
};
if (
  !parsed ||
  !parsed.host ||
  !parsed.username ||
  !parsed.password ||
  !parsed.database
) {
  throw new Error(
    'Database credentials are not defined in the environment variables',
  );
}
const credentials: Credentials = parsed as unknown as Credentials;
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // or 'mysql', 'mariadb', 'sqlite', etc.
      host: credentials['host'],
      port: 5432,
      username: credentials['username'],
      password: credentials['password'],
      database: credentials['database'],
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

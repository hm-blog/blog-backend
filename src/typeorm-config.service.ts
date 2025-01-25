import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>('NEST_DB_SERVER'),
      port: this.configService.get<number>('NEST_DB_PORT'),
      username: this.configService.get<string>('NEST_DB_USER'),
      password: this.configService.get<string>('NEST_DB_PASS'),
      database: this.configService.get<string>('NEST_DB_SCHEMA'),
      entities: ['dist/**/**/*.entity.{ts,js}'],
      synchronize: true,
    };
  }
}

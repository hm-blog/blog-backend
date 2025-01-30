import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class WeatherService {
  constructor(private readonly configService: ConfigService) {}
}

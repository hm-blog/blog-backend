import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query('latitude') latitude: number, @Query('longitude') longitude: number) {
    return await this.weatherService.searchWeather({ latitude, longitude });
  }
}

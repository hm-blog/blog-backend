import { Injectable } from '@nestjs/common';
import {
  AreaPointer,
  Location,
  MapForConvert,
  PTY,
  SKY,
  WeatherAPIRequestParamsDTO,
  WeatherAPIResponseDTO,
  WeatherCategoryCode,
  WeatherItem,
} from './weather.type';
import * as dayjs from 'dayjs';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { WeatherApiException } from '../exceptions/weather-api.exception';

@Injectable()
export class WeatherService {
  constructor(private readonly configService: ConfigService) {}

  async searchWeather(location: Location) {
    const weatherApiURL = this.configService.get<string>('NEST_WEATHER_BASEURL') as string; // API 요청 URL
    const serviceKey = this.configService.get<string>('NEST_WEATHER_ACCESS_KEY') as string; // 인증키
    const numOfRows = 100; // 한 페이지 결과 수
    const pageNo = 1; // 페이지 번호
    const dataType = 'JSON'; // 응답 자료 형식
    const { base_date, base_time } = this.getBaseDateTime();
    const { x: nx, y: ny } = this.convertLocationToAreaPointer(location);

    const url = `${weatherApiURL}/getVilageFcst`; // 단기예보 조회
    const params: WeatherAPIRequestParamsDTO = {
      serviceKey,
      numOfRows,
      pageNo,
      dataType,
      base_date,
      base_time,
      nx,
      ny,
    };

    const totalCount = await this.getCastTotalCount(url, params);

    const data: WeatherItem[] = [];
    for (let pageNo = 1; pageNo <= Math.floor(totalCount / 100) + 1; pageNo++) {
      const response = await axios.get<WeatherAPIResponseDTO>(url, {
        params,
      });
      if (+response.data.response.header.resultCode !== 0)
        throw new WeatherApiException(+response.data.response.header.resultCode);
      data.push(...response.data.response.body.items.item);
    }

    const dataAvg = data.reduce(
      (acc, curr) => {
        let dIdx = acc.findIndex((item) => item.date === curr.fcstDate);
        if (dIdx === -1) {
          acc.push({
            date: curr.fcstDate,
            time: [],
          });
          dIdx = acc.length - 1;
        }

        let tIdx = acc[dIdx].time.findIndex((item) => item.time === curr.fcstTime);
        if (tIdx === -1) {
          acc[dIdx].time.push({
            time: curr.fcstTime,
            category: [],
          });
          tIdx = acc[dIdx].time.length - 1;
        }

        let cIdx = acc[dIdx].time[tIdx].category.findIndex((item) => item.category === curr.category);
        if (cIdx === -1) {
          acc[dIdx].time[tIdx].category.push({
            category: curr.category,
            value: '',
            values: [],
            count: 0,
          });
          cIdx = acc[dIdx].time[tIdx].category.length - 1;
        }

        const item = acc[dIdx].time[tIdx].category[cIdx];
        item.values.push(curr.fcstValue);
        if (item.count === 0) {
          item.value = curr.fcstValue;
        } else {
          if (!Number.isNaN(parseFloat(curr.fcstValue)) && !Number.isNaN(parseFloat(item.value))) {
            item.value = `${(+item.value * item.count + +curr.fcstValue) / ++item.count}`;
          } else if (Number.isNaN(parseFloat(item.value))) {
            item.value = `${curr.fcstValue}`;
          }
        }

        return acc;
      },
      [] as {
        date: string;
        time: {
          time: string;
          category: { category: WeatherCategoryCode; value: string; count: number; values: string[] }[];
        }[];
      }[],
    );

    return dataAvg.map(({ date, time }) => ({
      date,
      time: time.map(({ time, category }) => ({
        time,
        category: category.map(({ category, value }) => ({
          category,
          ...this.convertWeatherCategoryForUser(category, value),
        })),
      })),
    }));
  }

  private getBaseDateTime(): { base_date: string; base_time: string } {
    const getBaseTime = (dateTime: dayjs.Dayjs, h: number, m: number = 0) => {
      return dateTime.set('hour', h).set('minute', m).format('HHmm');
    };
    const dateTime = dayjs();
    const currentTime = +dateTime.format('HHmm');

    let base_date = dateTime.format('YYYYMMDD');
    let base_time = dateTime.format('HHmm');

    if (currentTime < 210) {
      base_date = dateTime.subtract(1, 'day').format('YYYYMMDD');
      base_time = getBaseTime(dateTime, 23);
    } else if (currentTime < 510) {
      base_time = getBaseTime(dateTime, 2);
    } else if (currentTime < 810) {
      base_time = getBaseTime(dateTime, 5);
    } else if (currentTime < 1110) {
      base_time = getBaseTime(dateTime, 8);
    } else if (currentTime < 1410) {
      base_time = getBaseTime(dateTime, 11);
    } else if (currentTime < 1710) {
      base_time = getBaseTime(dateTime, 14);
    } else if (currentTime < 2010) {
      base_time = getBaseTime(dateTime, 17);
    } else if (currentTime < 2310) {
      base_time = getBaseTime(dateTime, 20);
    } else {
      base_time = getBaseTime(dateTime, 23);
    }

    return { base_date, base_time };
  }

  private async getCastTotalCount(url: string, params: WeatherAPIRequestParamsDTO) {
    const response = await axios.get<WeatherAPIResponseDTO>(url, {
      params: {
        ...params,
        numOfRows: 1,
      },
    });

    if (+response.data.response.header.resultCode !== 0)
      throw new WeatherApiException(+response.data.response.header.resultCode);

    return response.data.response.body.totalCount;
  }

  private convertLocationToAreaPointer(location: Location): AreaPointer {
    const map: MapForConvert = {
      Re: 6371.00877,
      grid: 5.0,
      slat1: 30.0,
      slat2: 60.0,
      olon: 126.0,
      olat: 38.0,
      xo: 210 / 5.0,
      yo: 675 / 5.0,
    };

    const PI = Math.PI;
    const DEGRAD = PI / 180.0;

    const re = map.Re / map.grid;
    const slat1 = map.slat1 * DEGRAD;
    const slat2 = map.slat2 * DEGRAD;
    const olon = map.olon * DEGRAD;
    const olat = map.olat * DEGRAD;

    let sn = Math.tan(PI * 0.25 + slat2 * 0.5) / Math.tan(PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    let sf = Math.tan(PI * 0.25 + slat1 * 0.5);
    sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
    let ro = Math.tan(PI * 0.25 + olat * 0.5);
    ro = (re * sf) / Math.pow(ro, sn);

    let ra = Math.tan(PI * 0.25 + location.latitude * DEGRAD * 0.5);
    ra = (re * sf) / Math.pow(ra, sn);
    let theta = location.longitude * DEGRAD - olon;

    if (theta > PI) theta -= 2.0 * PI;
    if (theta < -PI) theta += 2.0 * PI;
    theta *= sn;
    const x = Math.trunc(ra * Math.sin(theta) + map.xo + 1.5);
    const y = Math.trunc(ro - ra * Math.cos(theta) + map.yo + 1.5);
    return { x, y };
  }

  private convertWeatherCategoryForUser(code: WeatherCategoryCode, value: string): { name: string; value: string } {
    const result = { name: '항목없음', value: '' };
    switch (code) {
      case 'POP':
        result.name = '강수확률';
        result.value = `${value} ％`;
        break;
      case 'PTY':
        result.name = '강수형태';
        result.value = this.getValueByPTY(+value);
        break;
      case 'PCP':
        result.name = '1시간 강수량';
        result.value = `${value} ㎜`;
        break;
      case 'PEH':
        result.name = '습도';
        result.value = `${value} ％`;
        break;
      case 'SNO':
        result.name = '1시간 신적설';
        result.value = `${value} ㎝`;
        break;
      case 'SKY':
        result.name = '하늘상태';
        result.value = this.getValueBySKY(+value);
        break;
      case 'TMP':
        result.name = '1시간 기온';
        result.value = `${value} ℃`;
        break;
      case 'TMN':
        result.name = '일 최저기온';
        result.value = `${value} ℃`;
        break;
      case 'TMX':
        result.name = '일 최고기온';
        result.value = `${value} ℃`;
        break;
      case 'UUU':
        result.name = '풍속(동서성분)';
        result.value = `${value} ㎧`;
        break;
      case 'VVV':
        result.name = '풍속(남북성분)';
        result.value = `${value} ㎧`;
        break;
      case 'WAV':
        result.name = '파고';
        result.value = `${value} M`;
        break;
      case 'VEC':
        result.name = '풍향';
        result.value = this.getBearingsByValue(+value);
        break;
      case 'WSD':
        result.name = '풍속';
        result.value = `${value} ㎧`;
        break;
    }
    return result;
  }

  private getValueByPTY(code: PTY): string {
    let result = '항목없음';
    switch (code) {
      case PTY.none:
        result = '없음';
        break;
      case PTY.rain:
        result = '비';
        break;
      case PTY.rainAndSnow:
        result = '비/눈';
        break;
      case PTY.snow:
        result = '눈';
        break;
      case PTY.shower:
        result = '소나기';
        break;
      case PTY.raindrop:
        result = '빗방울눈날림';
        break;
      case PTY.raindropAndSnow:
        result = '눈날림';
        break;
    }

    return result;
  }

  private getValueBySKY(code: SKY): string {
    let result = '항목없음';
    switch (code) {
      case SKY.sunny:
        result = '맑음';
        break;
      case SKY.cloudy:
        result = '구름많음';
        break;
      case SKY.gray:
        result = '흐림';
        break;
    }

    return result;
  }

  private getBearingsByValue(value: number): string {
    const transNumber = Math.floor((value + 22.5 * 0.5) / 22.5);

    let result = '';
    switch (transNumber) {
      case 0:
        result = 'N';
        break;
      case 1:
        result = 'NNE';
        break;
      case 2:
        result = 'NE';
        break;
      case 3:
        result = 'ENE';
        break;
      case 4:
        result = 'E';
        break;
      case 5:
        result = 'ESE';
        break;
      case 6:
        result = 'SE';
        break;
      case 7:
        result = 'SSE';
        break;
      case 8:
        result = 'S';
        break;
      case 9:
        result = 'SSW';
        break;
      case 10:
        result = 'SW';
        break;
      case 11:
        result = 'WSW';
        break;
      case 12:
        result = 'W';
        break;
      case 13:
        result = 'WNW';
        break;
      case 14:
        result = 'NW';
        break;
      case 15:
        result = 'NNW';
        break;
      case 16:
        result = 'N';
        break;
    }
    return result;
  }
}

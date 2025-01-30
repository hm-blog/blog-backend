export interface MapForConvert {
  Re: number; // 지도 반경
  grid: number; // 격자 간격(km)
  slat1: number; // 표준 위도 1
  slat2: number; // 표준 위도 2
  olon: number; // 기준점 경도
  olat: number; // 기준점 위도
  xo: number; // 기준점 X 좌표
  yo: number; // 기준점 Y 좌표
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface AreaPointer {
  x: number;
  y: number;
}

export enum SKY { // 하늘 상태
  sunny = 1, // 맑음
  cloudy = 3, // 구름많음
  gray, // 흐림
}

export enum PTY { // 강수 형태
  none = 0, // 없음
  rain, // 비
  rainAndSnow, // 비와 눈
  snow, // 눈
  shower, // 소나기
  raindrop, // 빗방울,
  raindropAndSnow, // 빗방울 눈날림
}

export type WeatherCategoryCode =
  | 'POP'
  | 'PTY'
  | 'PCP'
  | 'PEH'
  | 'SNO'
  | 'SKY'
  | 'TMP'
  | 'TMN'
  | 'TMX'
  | 'UUU'
  | 'VVV'
  | 'WAV'
  | 'VEC'
  | 'WSD';

export interface WeatherItem {
  baseDate: string;
  baseTime: string;
  category: WeatherCategoryCode;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

export interface WeatherAPIRequestParamsDTO {
  serviceKey: string;
  numOfRows: number;
  pageNo: number;
  dataType: string;
  base_date: string;
  base_time: string;
  nx: number;
  ny: number;
}

export interface WeatherAPIResponseDTO {
  response: {
    header: {
      resultCode: number;
      resultMsg: string;
    };
    body: {
      dataType: 'XML' | 'JSON';
      items: {
        item: WeatherItem[];
      };
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}

export enum WeatherAPIErrorCode {
  APPLICATION_ERROR = 1,
  DB_ERROR,
  NODATA_ERROR,
  HTTP_ERROR,
  SERVICETIME_OUT,
  INVALID_REQUEST_PARAMETER_ERROR = 10,
  NO_MANDATORY_REQUEST_PARAMETERS_ERROR,
  NO_OPENAPI_SERVICE_ERROR,
  SERVICE_ACCESS_DENIED_ERROR = 20,
  TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR,
  LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR,
  SERVICE_KEY_IS_NOT_REGISTERED_ERROR = 30,
  DEADLINE_HAS_EXPIRED_ERROR,
  UNREGISTERED_IP_ERROR,
  UNSIGNED_CALL_ERROR,
  UNKNOWN_ERROR = 99,
}

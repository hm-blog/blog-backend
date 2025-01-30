import { WeatherAPIErrorCode } from '../weather/weather.type';
import { HttpStatus } from '@nestjs/common';
import { ServerException } from './server.exception';

export class WeatherApiException extends ServerException {
  constructor(errorCode: WeatherAPIErrorCode) {
    const getErrorMessage = (code: WeatherAPIErrorCode) => {
      let message = `알수 없는 에러. ErrorCode: ${code}`;
      let status = -1;
      switch (code) {
        case WeatherAPIErrorCode.APPLICATION_ERROR:
          message = '';
          break;

        case WeatherAPIErrorCode.NODATA_ERROR:
          message = '데이터가 없습니다.';
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          break;

        case WeatherAPIErrorCode.DB_ERROR:
        case WeatherAPIErrorCode.HTTP_ERROR:
        case WeatherAPIErrorCode.SERVICETIME_OUT:
          message = '공공기관의 자원에 문제가 생겼습니다. 복구된다면 정상 응답을 받아올 수 있습니다.';
          status = HttpStatus.SERVICE_UNAVAILABLE;
          break;
        case WeatherAPIErrorCode.INVALID_REQUEST_PARAMETER_ERROR:
        case WeatherAPIErrorCode.NO_MANDATORY_REQUEST_PARAMETERS_ERROR:
          message = '서버에 문제가 발생했습니다. 빠른 시일 내에 수정하겠습니다.';
          status = HttpStatus.SERVICE_UNAVAILABLE;
          break;

        case WeatherAPIErrorCode.NO_OPENAPI_SERVICE_ERROR:
          message = '서비스를 더 이상 제공하지 않습니다.';
          status = HttpStatus.NOT_IMPLEMENTED;
          break;

        case WeatherAPIErrorCode.SERVICE_ACCESS_DENIED_ERROR:
        case WeatherAPIErrorCode.TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR:
        case WeatherAPIErrorCode.SERVICE_KEY_IS_NOT_REGISTERED_ERROR:
        case WeatherAPIErrorCode.DEADLINE_HAS_EXPIRED_ERROR:
        case WeatherAPIErrorCode.UNREGISTERED_IP_ERROR:
        case WeatherAPIErrorCode.UNSIGNED_CALL_ERROR:
          message = '공공기관 인증에 실패하였습니다.';
          status = HttpStatus.UNAUTHORIZED;
          break;

        case WeatherAPIErrorCode.LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR:
          message = '공공기관 데이터 일일 요청 횟수를 초과하였습니다';
          status = HttpStatus.TOO_MANY_REQUESTS;
          break;

        case WeatherAPIErrorCode.UNKNOWN_ERROR:
          message = '알 수 없는 에러';
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
      }

      return { status, message };
    };
    const { status, message } = getErrorMessage(errorCode);
    super(status, message);
  }
}

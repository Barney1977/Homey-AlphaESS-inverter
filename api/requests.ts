'use strict';

import rateLimit from 'axios-rate-limit';
import { AxiosResponse, create } from 'axios';
import {
  requestLogger, responseLogger, errorLogger, setGlobalConfig,
} from 'axios-logger';
import signRequest from './signRequest';
import { ReturnData } from './responseTypes';

setGlobalConfig({
  prefixText: false,
  dateFormat: 'isoUtcDateTime',
  headers: false,
  status: true,
  method: true,
  params: true,
  data: true,
  //   logger: someLogger.info.bind(this),
});

const axiosInstance = rateLimit(create(), { maxRPS: 2 });
axiosInstance.interceptors.request.use(requestLogger, errorLogger);
axiosInstance.interceptors.response.use(responseLogger, errorLogger);

const API_URL = 'https://openapi.alphaess.com/api';

export const Requests = {
  // get
  EssList: 'getEssList',
  EvChargerConfigList: 'getEvChargerConfigList',

  LastPowerData: 'getLastPowerData',
  OneDateEnergyBySn: 'getOneDateEnergyBySn',

  EvChargerStatusBySn: 'getEvChargerStatusBySn',
  EvChargerCurrentsBySn: 'getEvChargerCurrentsBySn',

  ChargeConfig: 'getChargeConfigInfo',
  DisChargeConfig: 'getDisChargeConfigInfo',

  // post
  ControlEvCharger: 'remoteControlEvCharger',
  ControlEvChargerCurrent: 'setEvChargerCurrentsBySn',

  ControlDisChargeConfig: 'updateDisChargeConfigInfo',
  ControlChargeConfig: 'updateChargeConfigInfo',
};

type SettingsFunc = {
  get?: (key: string) => string;
  appId?: string;
  appSecret?: string;
};

type UndefinedMap = { [key: string]: string | number };
const SUCCESS = 200;

function validateResponse(response: AxiosResponse) {
  // eslint-disable-next-line prefer-destructuring
  const data: ReturnData = response.data;

  if (response.status !== SUCCESS || data?.code !== SUCCESS) {
    if (data?.expMsg || data?.msg) {
      // eslint-disable-next-line prefer-const
      let { msg, expMsg } = data;

      if (expMsg) {
        if (!msg) {
          msg = expMsg;
        } else {
          msg += ` (${data.expMsg})`;
        }
      }

      throw new Error(`${msg} #${data.code}`);
    }

    throw new Error(response.statusText);
  }
}

export async function getApi<T, T2 = UndefinedMap>(name: string, settings: SettingsFunc, params?: T2): Promise<T> {
  const appId = typeof settings.get === 'function' ? settings.get('appId') : settings.appId;
  const appSecret = typeof settings.get === 'function' ? settings.get('appSecret') : settings.appSecret;

  if (!appId || !appSecret) {
    throw new Error('Missing configuration: appId, appSecret');
  }

  const response = await axiosInstance.get(
    `${API_URL}/${name}`,
    {
      headers: signRequest(appId, appSecret),
      params,
    },
  );

  validateResponse(response);
  return response.data?.data;
}

export async function postApi<T2 = UndefinedMap, T = ReturnData<null>>(name: string, settings: SettingsFunc, body?: T2): Promise<T> {
  const appId = typeof settings.get === 'function' ? settings.get('appId') : settings.appId;
  const appSecret = typeof settings.get === 'function' ? settings.get('appSecret') : settings.appSecret;

  if (!appId || !appSecret) {
    throw new Error('Missing configuration: appId, appSecret');
  }

  const response = await axiosInstance.post(
    `${API_URL}/${name}`,
    body,
    {
      headers: signRequest(appId, appSecret),
    },
  );

  validateResponse(response);
  return response.data;
}

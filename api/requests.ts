'use strict';

import rateLimit from 'axios-rate-limit';
import { create } from 'axios';
import {
  requestLogger, responseLogger, errorLogger, setGlobalConfig,
} from 'axios-logger';
import signRequest from './signRequest';

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

const axiosInstance = rateLimit(create(), { maxRPS: 1 });
axiosInstance.interceptors.request.use(requestLogger, errorLogger);
axiosInstance.interceptors.response.use(responseLogger, errorLogger);

const API_URL = 'https://openapi.alphaess.com/api';

export const Requests = {
  // get
  EssList: 'getEssList',
  LastPowerData: 'getLastPowerData',
  EvChargerConfigList: 'getEvChargerConfigList',
  EvChargerStatusBySn: 'getEvChargerStatusBySn',
  OneDateEnergyBySn: 'getOneDateEnergyBySn',

  // post
  ControlEvCharger: 'remoteControlEvCharger',
};

type SettingsFunc = {
  get?: (key: string) => string;
  appId?: string;
  appSecret?: string;
};

export async function getApi<T>(name: string, settings: SettingsFunc, params?: { [key: string]: string | number }): Promise<T> {
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

  return response.data?.data;
}

export async function postApi<T>(name: string, settings: SettingsFunc, body?: { [key: string]: string | number }): Promise<T> {
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

  return response.data;
}

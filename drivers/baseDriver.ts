'use strict';

import { Driver } from 'homey';
import {
  Requests, getApi,
} from '../api/requests';
import { EssListResponseData, EssListResponseElement } from '../api/responseTypes';

export default class BaseDriver extends Driver {

  getName(data: EssListResponseElement): string {
    return data.minv as string;
  }

  async onPairListDevices(): Promise<unknown[]> {
    try {
      const devices = await this.fetchinvdata();
      this.log('onPairListDevices', devices);

      // Map API response to Homey device objects
      return devices
        ? devices.map((device) => {
          return {
            name: this.getName(device),
            data: {
              id: device.sysSn,
              // eslint-disable-next-line node/no-unsupported-features/es-syntax
              ...device,
            },
            settings: {
              sysSn: device.sysSn,
            },
          };
        })
        : [];
    } catch (error) {
      this.log('Failed to list devices:', error);
      throw new Error('Failed to list devices');
    }
  }

  async fetchinvdata(): Promise<EssListResponseData | null> {
    try {
      return getApi(Requests.EssList, this.homey.settings);
    } catch (error) {
      return null;
    }
  }

}

'use strict';

import BaseDriver from '../baseDriver';
import { Requests, getApi } from '../../api/requests';
import { EvChargerConfigListData } from '../../api/responseTypes';

class ChargerDriver extends BaseDriver {

  async fetchChargers(sysSn: string): Promise<EvChargerConfigListData | null> {
    try {
      return getApi<EvChargerConfigListData>(Requests.EvChargerConfigList, this.homey.settings, { sysSn });
    } catch (error) {
      this.error('Failed to fetch data:', error);
    }

    return null;
  }

  async onPairListDevices(): Promise<unknown[]> {
    try {
      const inverters = await this.fetchinvdata() ?? [];
      this.log('onPairListDevices', inverters);

      const result = [];
      for (const inv of inverters) {
        const chargers = await this.fetchChargers(inv.sysSn);

        this.log('chargers', chargers);
        result.push(...(chargers || []).map((c) => {
          return {
            // eslint-disable-next-line node/no-unsupported-features/es-syntax
            ...c,
            sysSn: inv.sysSn,
          };
        }));
      }

      // Map API response to Homey device objects
      return result.length > 0
        ? result.map((device) => {
          return {
            name: device.evchargerModel,
            data: {
              id: device.evchargerSn,
              // eslint-disable-next-line node/no-unsupported-features/es-syntax
              ...device,
            },
            settings: {
              sysSn: device.sysSn,
              evchargerSn: device.evchargerSn,
            },
          };
        })
        : [];
    } catch (error) {
      this.log('Failed to list devices:', error);
      throw new Error('Failed to list devices');
    }
  }

}

module.exports = ChargerDriver;

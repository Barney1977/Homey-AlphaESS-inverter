'use strict';

import BaseDevice from '../baseDevice';
import { powerToBatteryState } from '../../utils/batteryState';
import { ChargeConfigInfo, DisChargeConfigInfo, LastPowerData } from '../../api/responseTypes';
import { postApi, Requests } from '../../api/requests';
import { ChargeConfigParams, DisChargeConfigParams } from '../../api/paramTypes';
import config from './driver.compose.json';

class BatteryDevice extends BaseDevice {

  async onInit() {
    await super.onInit();
    await this.checkCapabilites(config.capabilities);

    this.homey.flow.getActionCard('get-charge-times').registerRunListener(async (_args, _state) => {
      const sysSn = this.getSetting('sysSn');
      const info = await this.fetchData<ChargeConfigInfo>(Requests.ChargeConfig, { sysSn });

      return {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...info || {},
        gridCharge: info?.gridCharge === 1,
      };
    });

    this.homey.flow.getActionCard('set-charge-times').registerRunListener(async (args, _state) => {
      const sysSn = this.getSetting('sysSn');
      const {
        batHighCap, gridCharge, timeChaf1, timeChaf2, timeChae1, timeChae2,
      } = args;

      await postApi<ChargeConfigParams>(Requests.ControlChargeConfig, this.homey.settings, {
        sysSn,
        batHighCap,
        gridCharge: gridCharge ? 1 : 0,
        timeChae1,
        timeChae2,
        timeChaf1,
        timeChaf2,
      });
    });

    this.homey.flow.getActionCard('get-discharge-times').registerRunListener(async (_args, _state) => {
      const sysSn = this.getSetting('sysSn');
      const info = await this.fetchData<DisChargeConfigInfo>(Requests.DisChargeConfig, { sysSn });

      return {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...info || {},
        ctrDis: info?.ctrDis === 1,
      };
    });

    this.homey.flow.getActionCard('set-discharge-times').registerRunListener(async (args, _state) => {
      const sysSn = this.getSetting('sysSn');
      const {
        batUseCap, ctrDis, timeDise1, timeDise2, timeDisf1, timeDisf2,
      } = args;

      await postApi<DisChargeConfigParams>(Requests.ControlDisChargeConfig, this.homey.settings, {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        sysSn,
        batUseCap,
        ctrDis: ctrDis ? 1 : 0,
        timeDise1,
        timeDise2,
        timeDisf1,
        timeDisf2,
      });
    });
  }

  async handlePowerData(data: LastPowerData) {
    await super.handlePowerData(data);

    await Promise.all([
      this.setCapabilityValue('measure_battery', data.soc),
      this.setCapabilityValue('measure_power', data.pbat),

      this.setCapabilityValue('battery_charging_state', powerToBatteryState(data.pbat)),
    ]);
  }

}

module.exports = BatteryDevice;

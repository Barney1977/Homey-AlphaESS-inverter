'use strict';

import BaseDevice from '../baseDevice';
import { powerToBatteryState } from '../../utils/batteryState';
import { LastPowerData } from '../../api/responseTypes';

class BatteryDevice extends BaseDevice {

  async onInit() {
    await super.onInit();

    if (this.hasCapability('battery_charging_state')) {
      await this.addCapability('battery_charging_state');
    }
  }

  async setCapabilities(data: LastPowerData) {
    await Promise.all([
      this.setCapabilityValue('measure_battery', data.soc),
      this.setCapabilityValue('measure_power', data.pbat * -1),

      this.setCapabilityValue('battery_charging_state', powerToBatteryState(data.pbat * -1)),
    ]);
  }

}

module.exports = BatteryDevice;

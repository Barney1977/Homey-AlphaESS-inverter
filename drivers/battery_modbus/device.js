'use strict';

import BaseDevice from '../baseModbusDevice';

class BatteryDevice extends BaseDevice {

  async setCapabilities(data) {
    await Promise.all([
      this.setCapabilityValue('measure_battery', data['0x102'].value),
      this.setCapabilityValue('measure_power', data['0x126'].value),
    ]);
  }

}

module.exports = BatteryDevice;

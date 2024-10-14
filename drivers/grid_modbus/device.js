'use strict';

import BaseDevice from '../baseModbusDevice';

class GridDevice extends BaseDevice {

  async setCapabilities(data) {
    const grid = data['0x21'].value;

    await Promise.all([
      this.setCapabilityValue('measure_power', data['0x21'].value),
      this.setCapabilityValue('measure_power.load', data['0x40C'].value),

      this.setCapabilityValue('measure_power.L1', data['0x1B'].value),
      this.setCapabilityValue('measure_power.L2', data['0x1D'].value),
      this.setCapabilityValue('measure_power.L3', data['0x1F'].value),

      this.setCapabilityValue('measure_power.imported', grid >= 0 ? grid : 0),
      this.setCapabilityValue('measure_power.exported', grid < 0 ? grid : 0),
    ]);
  }

}

module.exports = GridDevice;

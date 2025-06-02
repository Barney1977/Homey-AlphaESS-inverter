'use strict';

import { LastPowerData, OneDateEnergyBySnData } from '../../api/responseTypes';
import BaseDevice from '../baseDevice';
import config from './driver.compose.json';

class GridDevice extends BaseDevice {

  async onInit() {
    await super.onInit();
    await this.checkCapabilites(config.capabilities);
  }

  async handleEnergyData(energy: OneDateEnergyBySnData) {
    await super.handleEnergyData(energy);

    await Promise.all([
      this.setCapabilityValue('meter_power.imported', energy.eInput),
      this.setCapabilityValue('meter_power.exported', energy.eOutput),
    ]);
  }

  async handlePowerData(data: LastPowerData) {
    await super.handlePowerData(data);

    await Promise.all([
      this.setCapabilityValue('measure_power.load', data.pload),
      this.setCapabilityValue('measure_power', data.pgrid),

      this.setCapabilityValue('measure_power.L1', data.pgridDetail.pmeterL1),
      this.setCapabilityValue('measure_power.L2', data.pgridDetail.pmeterL2),
      this.setCapabilityValue('measure_power.L3', data.pgridDetail.pmeterL3),

      this.setCapabilityValue('measure_power.imported', data.pgrid > 0 ? data.pgrid : 0),
      this.setCapabilityValue('measure_power.exported', data.pgrid < 0 ? data.pgrid * -1 : 0),
    ]);
  }

}

module.exports = GridDevice;

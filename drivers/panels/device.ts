'use strict';

import { LastPowerData, OneDateEnergyBySnData } from '../../api/responseTypes';
import BaseDevice from '../baseDevice';
import config from './driver.compose.json';

class PanelDevice extends BaseDevice {

  async onInit() {
    await this.checkCapabilites(config.capabilities);
    await super.onInit();
  }

  async handleEnergyData(energy: OneDateEnergyBySnData) {
    await super.handleEnergyData(energy);
    await Promise.all([
      this.setCapabilityValue('meter_power', energy.epv),
    ]);
  }

  async handlePowerData(data: LastPowerData) {
    await super.handlePowerData(data);
    await Promise.all([
      this.setCapabilityValue('measure_power', data.ppv),

      this.setCapabilityValue('measure_power.ppv1', data.ppvDetail.ppv1),
      this.setCapabilityValue('measure_power.ppv2', data.ppvDetail.ppv2),
      this.setCapabilityValue('measure_power.ppv3', data.ppvDetail.ppv3),
      this.setCapabilityValue('measure_power.ppv4', data.ppvDetail.ppv4),
    ]);
  }

}

module.exports = PanelDevice;

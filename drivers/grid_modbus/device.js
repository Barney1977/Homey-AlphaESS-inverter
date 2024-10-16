'use strict';

import BaseDevice from '../baseModbusDevice';

class GridDevice extends BaseDevice {

  flowTrigger;

  async onInit() {
    await super.onInit();
    this.flowTrigger = this.homey.flow.getTriggerCard('alpha_state_changed');
  }


  async setCapabilities(data) {
    // const pv = data['0x41F'].value
    //   + data['0x423'].value
    //   + data['0x427'].value
    //   + data['0x429'].value;

    const grid = data['0x21'].value;
    const inverter = data['0x40C'].value;
    const battery = data['0x126'].value;

    let load = 0;

    // battery discharging
    if (battery > 0) {
      load = battery + grid;
    } else {
      load = inverter + grid + battery;
    }

    const oldState = this.getCapabilityValue('alpha_state');
    const newState = `${data['0x440'].value}`;

    await Promise.all([
      this.setCapabilityValue('measure_power', grid),
      this.setCapabilityValue('measure_power.load', load),

      this.setCapabilityValue('measure_power.L1', data['0x1B'].value),
      this.setCapabilityValue('measure_power.L2', data['0x1D'].value),
      this.setCapabilityValue('measure_power.L3', data['0x1F'].value),

      this.setCapabilityValue('measure_power.imported', grid >= 0 ? grid : 0),
      this.setCapabilityValue('measure_power.exported', grid < 0 ? grid * -1 : 0),

      this.setCapabilityValue('alpha_state', newState),
    ]);

    if (oldState !== newState) {
      this.log('Triggering alpha_state_changed');
      await this.flowTrigger.trigger({
        alpha_state: data['0x440'].value_name,
      });
    }
  }

}

module.exports = GridDevice;

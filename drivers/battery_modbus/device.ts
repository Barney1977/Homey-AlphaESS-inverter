'use strict';

import ModbusBaseDevice from '../baseModbusDevice';
import { powerToBatteryState } from '../../utils/batteryState';
import { formatBit } from '../../utils/formatBit';
import { ModbusResult } from '../../modbus/reader';
import config from './driver.compose.json';

class BatteryDevice extends ModbusBaseDevice {

  async onInit() {
    await this.checkCapabilites(config.capabilities);
    await super.onInit();
  }

  async setCapabilities(data: ModbusResult) {
    await Promise.all([
      this.setCapabilityValue('measure_battery', data['0x102'].value),
      this.setCapabilityValue('measure_power', data['0x126'].value),

      this.setCapabilityValue('battery_charging_state', powerToBatteryState(data['0x126'].value as number)),

      this.setCapabilityValue('alarm_battery', data['0x11C'].value !== '00000000000000000000000000000000' || data['0x11E'].value !== '00000000000000000000000000000000'),
      this.setCapabilityValue('alpha_fault_text.warning', formatBit(data['0x11C'].value_string)),
      this.setCapabilityValue('alpha_fault_text.fault', formatBit(data['0x11E'].value_string)),

      this.setCapabilityValue('meter_power.charged', data['0x120'].value),
      this.setCapabilityValue('meter_power.discharged', data['0x122'].value),
      this.setCapabilityValue('meter_power.grid', data['0x124'].value),
    ]);
  }

}

module.exports = BatteryDevice;

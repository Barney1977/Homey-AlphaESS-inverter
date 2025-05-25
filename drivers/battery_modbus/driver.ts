'use strict';

import { ModbusResult } from '../../modbus/reader';
import BaseDriver from '../baseMobusDriver';

class BatteryDriver extends BaseDriver {

  getName(data: ModbusResult) {
    return data['0x11A'].value_name || 'Battery';
  }

}

module.exports = BatteryDriver;

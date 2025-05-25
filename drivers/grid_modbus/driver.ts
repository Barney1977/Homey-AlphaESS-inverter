'use strict';

import { ModbusResult } from '../../modbus/reader';
import BaseDriver from '../baseMobusDriver';

class GridDriver extends BaseDriver {

  getName(data: ModbusResult) {
    return 'Grid Modbus Meter';
  }

}

module.exports = GridDriver;

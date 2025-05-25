'use strict';

import { ModbusResult } from '../../modbus/reader';
import BaseDriver from '../baseMobusDriver';

class PanelsDriver extends BaseDriver {

  getName(data: ModbusResult) {
    return 'Modbus Solarpanels';
  }

}

module.exports = PanelsDriver;

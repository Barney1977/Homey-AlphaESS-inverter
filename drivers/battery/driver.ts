'use strict';

import { EssListResponseElement } from '../../api/responseTypes';
import BaseDriver from '../baseDriver';

class BatteryDriver extends BaseDriver {

  getName(data: EssListResponseElement) {
    return data.mbat;
  }

}

module.exports = BatteryDriver;

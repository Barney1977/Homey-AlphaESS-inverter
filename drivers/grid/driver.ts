'use strict';

import { EssListResponseElement } from '../../api/responseTypes';
import BaseDriver from '../baseDriver';

class GridDriver extends BaseDriver {

  getName(data: EssListResponseElement) {
    return 'Grid Meter';
  }

}

module.exports = GridDriver;

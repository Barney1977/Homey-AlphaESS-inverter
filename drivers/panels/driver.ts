'use strict';

import { EssListResponseElement } from '../../api/responseTypes';
import BaseDriver from '../baseDriver';

class PanelsDriver extends BaseDriver {

  getName(data: EssListResponseElement) {
    return 'Solarpanels';
  }

}

module.exports = PanelsDriver;

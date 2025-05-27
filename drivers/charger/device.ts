'use strict';

import { FlowCardTrigger } from 'homey';
import BaseDevice from '../baseDevice';
import {
  Requests, postApi,
} from '../../api/requests';
import {
  EvChargerStatus, EvChargerStatusBySnData, LastPowerData, OneDateEnergyBySnData, ReturnData,
} from '../../api/responseTypes';

class ChargerDevice extends BaseDevice {

  async onInit() {
    await super.onInit();

    await this.registerCapabilityListener('evcharger_charging', (val) => this.controlState(val));
  }

  async controlState(on: boolean) {
    const sysSn = this.getSetting('sysSn');
    const evchargerSn = this.getSetting('evchargerSn');

    if (!sysSn || !evchargerSn) {
      this.log('Missing configuration: sysSn, evchargerSn');
      return;
    }

    try {
      this.log('Set charge to', on);

      const response = await postApi<ReturnData<unknown>>(Requests.ControlEvCharger, this.homey.settings, {
        sysSn,
        evchargerSn,
        controlMode: on ? 1 : 0,
      });

      this.log('Executed', response);
    } catch (error) {
      this.error('Failed to control state', error);
    }
  }

  convertState(s?: EvChargerStatus): string {
    switch (s) {
      case EvChargerStatus.Charging:
        return 'plugged_in_charging';

      case EvChargerStatus.SuspendedEV:
      case EvChargerStatus.SuspendedEVSE:
        return 'plugged_in_paused';

      case EvChargerStatus.Preparing:
        return 'plugged_in';

      // case EvChargerStatus.Available:
      default:
        return 'plugged_out';
    }
  }

  async task() {
    const base = super.task();

    const sysSn = this.getSetting('sysSn');
    const evchargerSn = this.getSetting('evchargerSn');

    if (!sysSn || !evchargerSn) {
      this.log('Missing configuration: sysSn, evchargerSn');
      return;
    }

    const evChargerStatus = await this.fetchData<EvChargerStatusBySnData>(Requests.EvChargerStatusBySn, { sysSn, evchargerSn });
    const newChargerState = evChargerStatus ? evChargerStatus.evchargerStatus : undefined;

    await this.setCapabilityValue('evcharger_charging_state', this.convertState(newChargerState));
    await this.setCapabilityValue('evcharger_charging', newChargerState === EvChargerStatus.Charging);

    const queryDate = new Date().toISOString().substring(0, 10);
    const energy = await this.fetchData<OneDateEnergyBySnData>(Requests.OneDateEnergyBySn, { sysSn, queryDate });
    await this.setCapabilityValue('meter_power.charged', energy?.eChargingPile);

    await base;
  }

  async setCapabilities(data: LastPowerData) {
    await Promise.all([
      this.setCapabilityValue('measure_power', data.pev),

      this.setCapabilityValue('measure_power.ev1', data.pevDetail.ev1Power),
      this.setCapabilityValue('measure_power.ev2', data.pevDetail.ev2Power),
      this.setCapabilityValue('measure_power.ev3', data.pevDetail.ev3Power),
      this.setCapabilityValue('measure_power.ev4', data.pevDetail.ev4Power),
    ]);
  }

}

module.exports = ChargerDevice;

'use strict';

import { FlowCardTrigger } from 'homey';
import BaseDevice from '../baseDevice';
import {
  Requests, postApi,
} from '../../api/requests';
import { EvChargerStatus, EvChargerStatusBySnData, LastPowerData, OneDateEnergyBySnData, ReturnData } from '../../api/responseTypes';

class ChargerDevice extends BaseDevice {

  stateFlowTrigger!: FlowCardTrigger;

  async onInit() {
    await super.onInit();

    await this.registerCapabilityListener('onoff', (val) => this.controlState(val));
    this.stateFlowTrigger = this.homey.flow.getTriggerCard('alpha_charger_state_changed');
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

  async task() {
    const base = super.task();

    const sysSn = this.getSetting('sysSn');
    const evchargerSn = this.getSetting('evchargerSn');

    if (!sysSn || !evchargerSn) {
      this.log('Missing configuration: sysSn, evchargerSn');
      return;
    }

    const evChargerStatus = await this.fetchData<EvChargerStatusBySnData>(Requests.EvChargerStatusBySn, { sysSn, evchargerSn });
    const oldChargerState = this.getCapabilityValue('alpha_charger_state');
    const newChargerState = evChargerStatus ? evChargerStatus.evchargerStatus.toString() : null;

    if (oldChargerState !== newChargerState) {
      await this.setCapabilityValue('alpha_charger_state', newChargerState);
      await this.stateFlowTrigger.trigger({
        alpha_charger_state: newChargerState,
      });
    }

    await this.setCapabilityValue('onoff', newChargerState === EvChargerStatus.Charging.toString());

    const ts = new Date().toISOString().substring(0, 10);
    const energy = await this.fetchData<OneDateEnergyBySnData>(Requests.OneDateEnergyBySn, { sysSn, queryDate: ts });
    await this.setCapabilityValue('meter_power', energy?.eChargingPile);

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

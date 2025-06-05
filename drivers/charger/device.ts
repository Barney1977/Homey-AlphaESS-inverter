'use strict';

import BaseDevice from '../baseDevice';
import {
  Requests, postApi,
} from '../../api/requests';
import {
  EvChargerCurrentsBySn,
  EvChargerStatus, EvChargerStatusBySnData, LastPowerData, OneDateEnergyBySnData, ReturnData,
} from '../../api/responseTypes';
import { ControlMode, Current, EVCharger } from '../../api/paramTypes';
import config from './driver.compose.json';

class ChargerDevice extends BaseDevice {

  async onInit() {
    await super.checkCapabilites(config.capabilities);
    await super.onInit();

    await this.registerCapabilityListener('evcharger_charging', (val) => this.controlState(val));
    this.homey.flow.getActionCard('set-current').registerRunListener(({ current }, _state) => this.controlCurrent(current));
  }

  async controlCurrent(currentsetting: number) {
    const sysSn = this.getSetting('sysSn');
    this.log('Set curren t to', currentsetting);

    await postApi<Current>(Requests.ControlEvChargerCurrent, this.homey.settings, {
      sysSn,
      currentsetting,
    });
  }

  async controlState(on: boolean) {
    const sysSn = this.getSetting('sysSn');
    const evchargerSn = this.getSetting('evchargerSn');

    this.log('Set charge to', on);

    await postApi<ControlMode>(Requests.ControlEvCharger, this.homey.settings, {
      sysSn,
      evchargerSn,
      controlMode: on ? 1 : 0,
    });
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

  async runTask() {
    await super.runTask();

    const sysSn = this.getSetting('sysSn');
    const evchargerSn = this.getSetting('evchargerSn');

    const [evChargerStatus, current] = await Promise.all([
      this.fetchData<EvChargerStatusBySnData, EVCharger>(Requests.EvChargerStatusBySn, { sysSn, evchargerSn }),
      this.fetchData<EvChargerCurrentsBySn, EVCharger>(Requests.EvChargerCurrentsBySn, { sysSn, evchargerSn }),
    ]);

    const newChargerState = evChargerStatus ? evChargerStatus.evchargerStatus : undefined;

    await Promise.all([
      this.setCapabilityValue('evcharger_charging_state', this.convertState(newChargerState)),
      this.setCapabilityValue('evcharger_charging', newChargerState === EvChargerStatus.Charging),
      this.setCapabilityValue('measure_current', current?.currentsetting),
    ]);
  }

  async handleEnergyData(data: OneDateEnergyBySnData) {
    await super.handleEnergyData(data);

    await Promise.all([
      this.setCapabilityValue('meter_power.charged', data.eChargingPile),
    ]);
  }

  async handlePowerData(data: LastPowerData) {
    await super.handlePowerData(data);

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

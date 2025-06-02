'use strict';

import { EventEmitter } from 'events';
import ManagerSettings from 'homey/manager/settings';
import { getApi, Requests } from './requests';
import { ByDate } from './paramTypes';
import { LastPowerData, OneDateEnergyBySnData } from './responseTypes';

const INTERVAL = 10 * 1000;

export default class StatisticsEventEmitter extends EventEmitter {

  minInterval: number = Number.MAX_SAFE_INTEGER;
  pollingTask: string | number | NodeJS.Timeout | undefined;

  constructor(private settings: ManagerSettings, private sysSn: string) {
    super();
  }

  id() {
    return `${this.sysSn}`;
  }

  stop() {
    if (this.pollingTask) {
      clearInterval(this.pollingTask);
    }

    this.pollingTask = undefined;
  }

  start(interval = INTERVAL) {
    const min = Math.min(this.minInterval, interval);

    if ((this.pollingTask && min < this.minInterval) || !this.pollingTask) {
      this.minInterval = min;
      this.stop();
    }

    if (!this.pollingTask) {
      // eslint-disable-next-line no-console
      console.log('[Background] (re)starting statistics polling for', this.id(), 'with interval', min, 'ms');

      // eslint-disable-next-line homey-app/global-timers, @typescript-eslint/no-misused-promises
      this.pollingTask = setInterval(this.poll.bind(this), this.minInterval);
    }
  }

  async poll() {
    // eslint-disable-next-line no-console
    console.log('[Background] Polling statistics for', this.id());

    try {
      const queryDate = new Date().toISOString().substring(0, 10);

      const [power, energy] = await Promise.all([
        getApi<LastPowerData>(Requests.LastPowerData, this.settings, { sysSn: this.sysSn }),
        getApi<OneDateEnergyBySnData, ByDate>(Requests.OneDateEnergyBySn, this.settings, { sysSn: this.sysSn, queryDate }),
      ]);

      if (power) {
        this.emit('power', power);
      }

      if (energy) {
        this.emit('energy', energy);
      }
    } catch (e) {
      this.emit('error', e);
    }
  }

}

'use strict';

import { Device } from 'homey';
import { LastPowerData, OneDateEnergyBySnData } from '../api/responseTypes';
import StatisticsEventEmitter from '../api/statistics';
import Mutex from '../utils/mutex';
import { getApi } from '../api/requests';
import { SysSsn } from '../api/paramTypes';

const EMITTERS: { [key: string]: { count: number, instance: StatisticsEventEmitter } } = {};
const mutex = new Mutex();

async function getInstance(name: string, construct: () => StatisticsEventEmitter) {
  const unlock = await mutex.lock();
  try {
    const inst = EMITTERS[name];
    if (inst) {
      inst.count += 1;
      return inst.instance;
    }

    const newInst = construct();

    EMITTERS[name] = {
      count: 1,
      instance: newInst,
    };

    return newInst;
  } finally {
    unlock();
  }
}

async function destroyInstance(name: string) {
  const unlock = await mutex.lock();
  try {
    const inst = EMITTERS[name];
    inst.count -= 1;

    if (inst.count === 0) {
      inst.instance.stop();
      delete EMITTERS[name];
    }
  } finally {
    unlock();
  }
}

export default class BaseDevice extends Device {

  taskInstance: string | number | NodeJS.Timeout | undefined;

  emitter?: StatisticsEventEmitter;

  errorEmitter?: (e: unknown) => void;
  powerEmitter?: (data: LastPowerData) => unknown;
  energyEmitter?: (data: OneDateEnergyBySnData) => unknown;

  async checkCapabilites(list: string[]) {
    await Promise.all(list.map((e) => {
      if (!this.hasCapability(e)) {
        return this.addCapability(e);
      }

      return null;
    }));
  }

  async onInit() {
    this.log('Device has been initialized');
    await this.startPolling();
  }

  async onSettings(/* { oldSettings, newSettings, changedKeys } */) {
    this.log('Settings changed');
    await this.startPolling();
  }

  async cleanup() {
    // Clear any existing emitter instances
    if (this.emitter) {
      this.log('Cleanup emitters');

      this.emitter.off('error', this.errorEmitter!);
      this.emitter.off('power', this.powerEmitter!);
      this.emitter.off('energy', this.energyEmitter!);

      await destroyInstance(this.emitter.id());
      this.emitter = undefined;
    }

    // Clear any existing task instance
    if (this.taskInstance) {
      this.log('Cleanup task');

      this.homey.clearInterval(this.taskInstance);
      this.taskInstance = undefined;
    }
  }

  async startPolling() {
    await this.cleanup();

    let interval = parseInt(this.getSetting('interval'), 10) || 10;
    if (Number.isNaN(interval) || interval <= 10) {
      interval = 10;
    }

    const sysSn = this.getSetting('sysSn');
    this.log('Starting polling', interval, 'ms', 'sysSn', sysSn);

    this.emitter = await getInstance(sysSn, () => new StatisticsEventEmitter(this.homey.settings, sysSn));

    this.errorEmitter = this.handleError.bind(this);
    this.emitter.on('error', this.errorEmitter);

    this.energyEmitter = this.handleEnergyData.bind(this);
    this.emitter.on('energy', this.energyEmitter);

    this.powerEmitter = this.handlePowerData.bind(this);
    this.emitter.on('power', this.powerEmitter);

    // this is done multiple times
    this.emitter.start(interval * 1000);

    this.taskInstance = this.homey.setInterval(this.runTask.bind(this), interval * 1000);
  }

  handleError(error: unknown) {
    this.error('Something went wrong', error);
  }

  async handlePowerData(_data: LastPowerData) {
    this.log('Power data received');
  }

  async handleEnergyData(_data: OneDateEnergyBySnData) {
    this.log('Energy data received');
  }

  async runTask() {
    this.log('Task running');
  }

  async fetchData<T, T2 = SysSsn>(api: string, params: T2): Promise<T | null> {
    try {
      return getApi(api, this.homey.settings, params);
    } catch (error) {
      this.error(error);
      return null;
    }
  }

  onDeleted() {
    this.log('Device has been deleted');

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.cleanup();
  }

}

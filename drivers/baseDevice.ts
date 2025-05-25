'use strict';

import { Device } from 'homey';
import { Requests, getApi } from '../api/requests';
import { LastPowerData } from '../api/responseTypes';

export default class BaseDevice extends Device {

  pollingTask?: NodeJS.Timeout;

  async onInit() {
    this.log('Device has been initialized');
    this.startPolling();
  }

  async onSettings(/* { oldSettings, newSettings, changedKeys } */) {
    this.startPolling();
  }

  startPolling() {
    // Clear any existing intervals
    if (this.pollingTask) this.homey.clearInterval(this.pollingTask);

    const refreshInterval = this.getSetting('interval') < 10
      ? 10 // refresh interval in seconds minimum 10
      : this.getSetting('interval');

    // Set up a new interval
    this.pollingTask = this.homey.setInterval(this.task.bind(this), refreshInterval * 1000);
  }

  // eslint-disable-next-line no-empty-function
  async setCapabilities(data: LastPowerData) { }

  async task() {
    const sysSn = this.getSetting('sysSn');
    if (!sysSn) {
      this.log('Missing configuration: sysSn');
      return;
    }

    const data = await this.fetchData<LastPowerData>(Requests.LastPowerData, { sysSn });
    if (data != null) {
      await this.setCapabilities(data);
    }
  }

  async fetchData<T>(api: string, params: { [key: string]: string | number }): Promise<T | null> {
    try {
      return getApi(api, this.homey.settings, params);
    } catch (error) {
      // globally logged, we handle no data
      return null;
    }
  }

  onDeleted() {
    this.log('Device has been deleted');

    // Clear the interval when the device is deleted
    this.homey.clearInterval(this.pollingTask);
  }

}

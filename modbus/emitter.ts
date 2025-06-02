'use strict';

import { EventEmitter } from 'events';
import { ModbusReader } from './reader';

const INTERVAL = 10 * 1000;

export default class ModbusEventEmitter extends EventEmitter {

  reader;
  pollingTask: string | number | NodeJS.Timeout | undefined;

  constructor(host: string, port?: number) {
    super();
    this.reader = new ModbusReader(host, port);
  }

  id() {
    return `${this.reader.host}:${this.reader.port}`;
  }

  stop() {
    clearInterval(this.pollingTask);
    this.pollingTask = undefined;
  }

  start(interval = INTERVAL) {
    if (this.pollingTask) {
      this.stop();
    }

    // eslint-disable-next-line homey-app/global-timers, @typescript-eslint/no-misused-promises
    this.pollingTask = setInterval(this.poll.bind(this), interval);
  }

  async poll() {
    try {
      const result = await this.reader.readOnce();
      this.emit('data', result);
    } catch (e) {
      this.emit('error', e);
    }
  }

}

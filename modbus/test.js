/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */

'use strict';

const Reader = require('./reader');
const ALL = require('./register_all.json');

const HOST = 'alphaess.iot.home.arpa';
const emitter = new Reader(HOST);

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  console.log(await emitter.readOnce(ALL));
})();

'use strict';

const Reader = require('./reader');
const ALL = require('./register_all.json');

const HOST = 'alphaess.iot.home.arpa';
const emitter = new Reader(HOST);

(async () => {
  console.log(await emitter.readOnce(ALL));
})();

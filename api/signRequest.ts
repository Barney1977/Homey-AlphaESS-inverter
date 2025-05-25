'use strict';

import generateHash from './generateHash';

export default function signRequest(appId: string, appSecret: string) {
  const timeStamp = Math.floor(Date.now() / 1000);
  const sign = generateHash(appId, appSecret, timeStamp);

  return {
    appId,
    timeStamp,
    sign,
  };
}

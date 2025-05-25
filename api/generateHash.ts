'use strict';

import crypto from 'crypto';

export default function generateHash(appId: string, appSecret: string, timestamp: number) {
  const data = `${appId}${appSecret}${timestamp}`;
  // Create a SHA-512 hash
  const hash = crypto.createHash('sha512').update(data).digest('hex');
  return hash;
}

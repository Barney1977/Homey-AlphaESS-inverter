'use strict';

// eslint-disable-next-line import/prefer-default-export
export function formatBit(b: number | string | undefined) {
  if (!b || b === '') return '-';
  return b;
}

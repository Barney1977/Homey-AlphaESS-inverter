'use strict';

export const BATTERY_STATES = {
  IDLE: 'idle',
  CHARGING: 'charging',
  DISCHARCHING: 'discharging',
};

export function powerToBatteryState(power: number | null) {
  if (power === 0 || power == null) return BATTERY_STATES.IDLE;
  if (power < 0) return BATTERY_STATES.CHARGING;
  return BATTERY_STATES.DISCHARCHING;
}

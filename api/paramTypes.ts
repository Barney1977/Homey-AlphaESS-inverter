'use strict';

export type DisChargeConfigParams = {
  sysSn: string,
  batUseCap: number,
  ctrDis: 0 | 1,
  timeDise1: string,
  timeDise2: string,
  timeDisf1: string,
  timeDisf2: string,
}

export type ChargeConfigParams = {
  sysSn: string,
  batHighCap: number,
  gridCharge: 0 | 1,
  timeChaf1: string,
  timeChae1: string,
  timeChaf2: string,
  timeChae2: string,
}

export type SysSsn = {
  sysSn: string;
}

export type ByDate = {
  queryDate: string;
} & SysSsn;

export type EVCharger = {
  evchargerSn: string,
} & SysSsn;

export type Current = {
  currentsetting: number,
} & SysSsn;

export type ControlMode = {
  controlMode: 0 | 1,
} & EVCharger;

'use strict';

export type EssListResponseElement = {
  cobat: number;
  emsStatus: string;
  mbat: string;
  minv: string;
  poinv: number;
  popv: number;
  surplusCobat: number;
  sysSn: string;
  usCapacity: number;
};

export type EssListResponseData = EssListResponseElement[];

/*
  1: Available state (not plugged in)
  2: Preparing state of insertion (plugged in and not activated)
  3: Charging state (charging with power output)
  4: SuspendedEVSE pile Suspended at the terminal (already started but no available power)
  5: SuspendedEV Suspended at the vehicle end (with available power, waiting for the car to respond)
  6: Finishing The charging end state (actively swiping the card to stop or EMS stop control)
  9: Faulted fault state (pile failure)
*/
export enum EvChargerStatus {
  Available = 1,
  Preparing = 2,
  Charging = 3,
  SuspendedEVSE = 4,
  SuspendedEV = 5,
  Finishing = 6,
  Faulted = 9
}

export type EvChargerStatusBySnData = {
  evchargerStatus: EvChargerStatus;
};

export type OneDateEnergyBySnData = {
  eCharge: number;
  eChargingPile: number;
  eDischarge: number;
  eGridCharge: number;
  eInput: number;
  eOutput: number;
  epv: number;
  sysSn: string;
  theDate: string;
};

export type EvChargerCurrentsBySn = {
  currentsetting: number;
}

export type LastPowerData = {
  ppv: number;
  ppvDetail: {
    ppv1: number;
    ppv2: number;
    ppv3: number;
    ppv4: number;
    pmeterDc: number;
  };
  pload: number;
  soc: number;
  pgrid: number;
  pgridDetail: {
    pmeterL1: number;
    pmeterL2: number;
    pmeterL3: number;
  };
  pbat: number;
  prealL1: number;
  prealL2: number;
  prealL3: number;
  pev: number;
  pevDetail: {
    ev1Power: number;
    ev2Power: number;
    ev3Power: number;
    ev4Power: number;
  };
};

export type EvChargerConfigListElement = {
  evchargerSn: string;
  evchargerModel: string;
};

export type EvChargerConfigListData = EvChargerConfigListElement[];

export type ChargeConfigInfo = {
  batHighCap: number,
  gridCharge: 0 | 1,
  timeChaf1: string,
  timeChaf2: string,
  timeChaf3: string,
  timeChaf4: string;
};

export type DisChargeConfigInfo = {
  batUseCap: number,
  ctrDis: 0 | 1,
  timeDise1: string,
  timeDise2: string,
  timeDisf1: string,
  timeDisf2: string,
};

export type ReturnData<T = null> = {
  code: number;
  msg: string;
  expMsg: string;
  data: T;
};

declare module "astronomia/base" {
  const base: {
    J2000Century: (jde: number) => number;
  };

  export default base;
}

declare module "astronomia/julian" {
  export class CalendarGregorian {
    constructor(year: number, month: number, day: number);
    toJD(): number;
  }
}

declare module "astronomia/moonposition" {
  export const position: (jde: number) => {
    lon: number;
    lat: number;
    range: number;
  };
}

declare module "astronomia/solar" {
  export const apparentLongitude: (T: number) => number;
}

declare module "astronomia/planetposition" {
  export class Planet {
    constructor(planet: object);
  }
}

declare module "astronomia/elliptic" {
  export const position: (
    planet: object,
    earth: object,
    jde: number,
  ) => {
    ra: number;
    dec: number;
  };
}

declare module "astronomia/data" {
  const data: {
    vsop87Bearth: object;
    vsop87Bmercury: object;
    vsop87Bvenus: object;
    vsop87Bmars: object;
    vsop87Bjupiter: object;
    vsop87Bsaturn: object;
    vsop87Buranus: object;
    vsop87Bneptune: object;
  };

  export default data;
}

declare module "lunar-javascript" {
  type Lunar = {
    getBaZi: () => string[];
    getBaZiWuXing: () => string[];
    getBaZiNaYin: () => string[];
    getBaZiShiShenGan: () => string[];
    getSeason: () => string;
    getYueXiang: () => string;
    getYearShengXiaoExact: () => string;
    getMonthShengXiaoExact: () => string;
    getDayShengXiao: () => string;
    getTimeShengXiao: () => string;
    getPrevJieQi: () => { getName: () => string } | null;
    getNextJieQi: () => { getName: () => string } | null;
  };

  type SolarDate = {
    getLunar: () => Lunar;
  };

  const lunar: {
    Solar: {
      fromYmdHms: (
        year: number,
        month: number,
        day: number,
        hour: number,
        minute: number,
        second: number,
      ) => SolarDate;
    };
  };

  export default lunar;
}

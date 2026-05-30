import base from "astronomia/base";
import data from "astronomia/data";
import { position as planetPosition } from "astronomia/elliptic";
import { position as moonPosition } from "astronomia/moonposition";
import { Planet } from "astronomia/planetposition";
import { apparentLongitude } from "astronomia/solar";
import { getJulianDay } from "./birthTime";
import type {
  BirthProfileInput,
  WesternAstrologySeed,
  WesternPlanetName,
  ZodiacPlacement,
} from "./birthProfileTypes";
import { normalizeDegrees, placementFromLongitude } from "./zodiacPlacement";

const radiansToDegrees = 180 / Math.PI;
const degreesToRadians = Math.PI / 180;
const obliquityDegrees = 23.4392911;
const j2000JulianDay = 2451545.0;
const greenwichSiderealBaseDegrees = 280.46061837;
const siderealDegreesPerDay = 360.98564736629;

const earth = new Planet(data.vsop87Bearth);
const westernPlanets: Record<WesternPlanetName, Planet> = {
  mercury: new Planet(data.vsop87Bmercury),
  venus: new Planet(data.vsop87Bvenus),
  mars: new Planet(data.vsop87Bmars),
  jupiter: new Planet(data.vsop87Bjupiter),
  saturn: new Planet(data.vsop87Bsaturn),
  uranus: new Planet(data.vsop87Buranus),
  neptune: new Planet(data.vsop87Bneptune),
};

const eclipticLongitudeFromEquatorial = (ra: number, dec: number) => {
  const obliquity = obliquityDegrees * degreesToRadians;
  const longitude = Math.atan2(
    Math.sin(ra) * Math.cos(obliquity) +
      Math.tan(dec) * Math.sin(obliquity),
    Math.cos(ra),
  );

  return normalizeDegrees(longitude * radiansToDegrees);
};

const getPlanetPlacements = (jde: number): Record<WesternPlanetName, ZodiacPlacement> =>
  Object.fromEntries(
    Object.entries(westernPlanets).map(([planetName, planet]) => {
      const equatorial = planetPosition(planet, earth, jde);

      return [
        planetName,
        placementFromLongitude(
          eclipticLongitudeFromEquatorial(equatorial.ra, equatorial.dec),
        ),
      ];
    }),
  ) as Record<WesternPlanetName, ZodiacPlacement>;

const getRisingPlacement = ({
  birthDate,
  birthPlace,
  birthTime,
}: BirthProfileInput): ZodiacPlacement | null => {
  if (!birthTime || !birthPlace) {
    return null;
  }

  const jde = getJulianDay({ birthDate, birthPlace, birthTime, name: "" });
  const daysSinceJ2000 = jde - j2000JulianDay;
  const greenwichSiderealDegrees = normalizeDegrees(
    greenwichSiderealBaseDegrees + siderealDegreesPerDay * daysSinceJ2000,
  );
  const localSidereal = normalizeDegrees(
    greenwichSiderealDegrees + birthPlace.longitude,
  );
  const theta = localSidereal * degreesToRadians;
  const latitude = birthPlace.latitude * degreesToRadians;
  const obliquity = obliquityDegrees * degreesToRadians;
  const ascendant = Math.atan2(
    -Math.cos(theta),
    Math.sin(theta) * Math.cos(obliquity) +
      Math.tan(latitude) * Math.sin(obliquity),
  );

  return placementFromLongitude(normalizeDegrees(ascendant * radiansToDegrees));
};

export const buildWesternAstrologySeed = (
  input: BirthProfileInput,
): WesternAstrologySeed => {
  const jde = getJulianDay(input);
  const century = base.J2000Century(jde);
  const sun = placementFromLongitude(apparentLongitude(century) * radiansToDegrees);
  const moon = placementFromLongitude(moonPosition(jde).lon * radiansToDegrees);
  const rising = getRisingPlacement(input);
  const planets = getPlanetPlacements(jde);
  const placements = [sun, moon, rising, ...Object.values(planets)].filter(
    (placement): placement is ZodiacPlacement => Boolean(placement),
  );

  return {
    sun,
    moon,
    rising,
    planets,
    elementBalance: [...new Set(placements.map((placement) => placement.element))],
    modalityBalance: [
      ...new Set(placements.map((placement) => placement.modality)),
    ],
    chartNotes: [
      "Use the full western chart as expression style, attention pattern, and misreading texture.",
      "Personal planets matter most for Initial Hand: Mercury as thought/speech, Venus as attachment, Mars as friction/initiative.",
      "Outer planets are slow background weather, not direct personality labels.",
      "Sun and moon are astronomical seed placements; rising requires birth time and place.",
      "Do not turn signs into personality labels or direct behavior commands.",
    ],
  };
};

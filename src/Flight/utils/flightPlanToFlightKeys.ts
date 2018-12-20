/* @flow */
import { StructuredFlightPlan, FlightKeys } from '../types';

export default function flightPlanToFlightKeys(
  structuredFlightPlan: StructuredFlightPlan,
): null | FlightKeys {
  const { flightPlan } = structuredFlightPlan;

  if (
    !flightPlan ||
    !flightPlan.aircraftId ||
    !flightPlan.aircraftId.aircraftId ||
    !flightPlan.aerodromeOfDeparture ||
    // @ts-ignore
    !flightPlan.aerodromeOfDeparture.icaoId ||
    !flightPlan.aerodromesOfDestination ||
    !flightPlan.aerodromesOfDestination.aerodromeOfDestination ||
    // @ts-ignore
    !flightPlan.aerodromesOfDestination.aerodromeOfDestination.icaoId
  ) {
    return null;
  }

  return {
    aircraftId: flightPlan.aircraftId.aircraftId,
    // @ts-ignore
    aerodromeOfDeparture: flightPlan.aerodromeOfDeparture.icaoId,
    airFiled: false,
    aerodromeOfDestination:
      // @ts-ignore
      flightPlan.aerodromesOfDestination.aerodromeOfDestination.icaoId,
    estimatedOffBlockTime: flightPlan.estimatedOffBlockTime,
  };
}

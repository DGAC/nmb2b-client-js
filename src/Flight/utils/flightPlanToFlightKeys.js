/* @flow */
import type { StructuredFlightPlan, FlightKeys } from '../types';

export default function flightPlanToFlightKeys(
  structuredFlightPlan: StructuredFlightPlan,
): ?FlightKeys {
  const { flightPlan } = structuredFlightPlan;

  if (
    !flightPlan ||
    !flightPlan.aircraftId ||
    !flightPlan.aircraftId.aircraftId ||
    !flightPlan.aerodromeOfDeparture ||
    !flightPlan.aerodromeOfDeparture.icaoId ||
    !flightPlan.aerodromesOfDestination ||
    !flightPlan.aerodromesOfDestination.aerodromeOfDestination ||
    !flightPlan.aerodromesOfDestination.aerodromeOfDestination.icaoId
  ) {
    return null;
  }

  return {
    aircraftId: flightPlan.aircraftId.aircraftId,
    aerodromeOfDeparture: flightPlan.aerodromeOfDeparture.icaoId,
    airFiled: false,
    aerodromeOfDestination:
      flightPlan.aerodromesOfDestination.aerodromeOfDestination.icaoId,
    estimatedOffBlockTime: flightPlan.estimatedOffBlockTime,
  };
}

import { StructuredFlightPlan, FlightKeys } from '../types';

export default function flightPlanToFlightKeys(
  structuredFlightPlan: StructuredFlightPlan,
): null | FlightKeys {
  const { flightPlan } = structuredFlightPlan;

  if (
    !flightPlan?.aircraftId?.aircraftId ||
    !flightPlan?.aerodromeOfDeparture ||
    !flightPlan?.aerodromesOfDestination?.aerodromeOfDestination
  ) {
    return null;
  }

  if (!('icaoId' in flightPlan.aerodromeOfDeparture)) {
    return null;
  }

  if (
    !('icaoId' in flightPlan.aerodromesOfDestination.aerodromeOfDestination)
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

/* @flow */
import { Flight, FlightKeys } from '../types';

export default function flightToFlightKeys(
  flightObject: Flight,
): null | FlightKeys {
  const {
    flightId: { keys },
  } = flightObject;

  if (
    !keys ||
    !keys.aircraftId ||
    !keys.aerodromeOfDeparture ||
    !keys.aerodromeOfDestination ||
    !keys.estimatedOffBlockTime
  ) {
    return null;
  }

  return {
    aircraftId: keys.aircraftId,
    aerodromeOfDeparture: keys.aerodromeOfDeparture,
    airFiled: false,
    aerodromeOfDestination: keys.aerodromeOfDestination,
    estimatedOffBlockTime: keys.estimatedOffBlockTime,
  };
}

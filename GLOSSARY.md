# NM B2B client

A TypeScript client for the Eurocontrol NM B2B SOAP API. NM B2B vocabulary (regulation, traffic volume, OTMV, AUP…) is defined by the XSD under `b2b-xsd/`; this glossary holds the terms this project adds.

## Language

### Errors

**Reply error**:
NM processed the request and returned a reply whose status is not `OK` (`NMB2BError`).
_Avoid_: B2B error, NM error

**Transport error**:
No usable B2B reply was obtained: network failure, HTTP error status, unreadable response or SOAP fault, on a query or while loading the WSDL (`NMB2BTransportError`).
_Avoid_: Network error (it is one `kind` of transport error), HTTP error, SOAP error

### Test fixtures

Terms keep their `Fixture` / `Recorded` prefix so they do not collide with B2B vocabulary (e.g. `scenarioReference`).

**Fixture scenario**:
One exported `defineFixture(...)` constant under `src/<Domain>/__fixtures__/`: an optional setup, the SOAP calls to make, and the tests run on their result.
_Avoid_: Fixture (alone), scenario (alone), test case

**Fixture recording**:
The run of a fixture scenario against the real B2B that writes its fixture artifacts (`pnpm update-fixtures`, `recordScenario`).
_Avoid_: Snapshot update, capture

**Fixture replay**:
The offline run of a fixture scenario from its fixture artifacts, MSW standing in for B2B (`registerFixtures`, `replayScenario`).
_Avoid_: Mocking, playback

**Fixture artifact**:
A file written by fixture recording next to the scenario, under `src/<Domain>/__fixtures__/<operation>/`: `context.json`, the recorded exchanges, the result snapshot.
_Avoid_: Mock (alone), recording (as a noun)

**Recorded exchange**:
A SOAP request sent during fixture recording and the B2B reply to it, identified by an `<id>` within a fixture scenario.
_Avoid_: Interaction, call, mock

**Replayed exchange**:
A recorded exchange during fixture replay, with the MSW handler that serves its reply once, to a request byte-identical to the recorded one (`ReplayedExchange`).
_Avoid_: Mocked exchange, served exchange

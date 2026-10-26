# NM B2B client

A TypeScript client for the Eurocontrol NM B2B SOAP API. NM B2B vocabulary (regulation, traffic volume, OTMV, AUP…) is defined by the XSD under `b2b-xsd/`; this glossary holds the terms this project adds.

## Language

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
A file written by fixture recording next to the scenario, under `src/<Domain>/__fixtures__/<operation>/`: `context.json`, the recorded B2B reply, the result snapshot.
_Avoid_: Mock (alone), recording (as a noun)

**Recorded exchange**:
A SOAP request sent during fixture recording and the B2B reply to it, identified by an `<id>` within a fixture scenario.
_Avoid_: Interaction, call, mock

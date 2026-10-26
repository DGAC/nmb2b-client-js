# Fixture replay matches recorded exchanges by exact request body

On fixture replay, MSW serves a recorded exchange's reply only to a POST whose body is byte-identical to its recorded request; any other request fails the replay. A change to what the client sends therefore fails the scenarios it touches until they are re-recorded against B2B (`pnpm update-fixtures`): a replayed reply always answers the request B2B actually received.

## Rejected alternative

**Serve replies by rank, assert requests with `toMatchFileSnapshot`**: the n-th request gets the n-th recorded reply, and a separate assertion compares each request to a snapshot, updatable offline with `vitest -u`. It gives a readable diff and fails fewer tests on a request change, but it ties replies to call order (no concurrent calls in a scenario), lets a reply answer a request B2B never saw once the snapshot is updated offline, and is less in the spirit of MSW, whose handlers match requests rather than count them.

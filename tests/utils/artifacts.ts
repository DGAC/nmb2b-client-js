import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { RecordedExchange, RecordedExchangeId } from './fixtures.ts';

/**
 * The contents of a fixture scenario's fixture artifacts: what fixture recording writes and fixture replay reads back.
 *
 * A scenario either has recorded exchanges, or, until it migrates to `recordExchange()`, a single raw B2B reply.
 */
export type FixtureArtifactContents<TVariables = unknown> = {
  /**
   * When the recording ran, right after `setup`. Recording and replay freeze the clock at this date
   * during `.run()`.
   */
  recordedAt: string;
  variables: TVariables;
} & (
  | {
      /**
       * The raw B2B reply of a scenario without recorded exchanges.
       */
      reply: string;
      exchanges?: never;
    }
  | {
      exchanges: Record<RecordedExchangeId, RecordedExchange>;
      reply?: never;
    }
);

interface FixtureContext<TVariables> {
  meta: {
    recordedAt: string;
  };
  variables: TVariables;
}

export type FixtureLocation = {
  filePath: string;
  exportName: string;
};

const REQUEST_SUFFIX = '.request.xml';
const REPLY_SUFFIX = '.mock.xml';

/**
 * Builds a recorded exchange. Only the fixture harness calls it: from what it captured during
 * fixture recording, or from the fixture artifacts on replay.
 */
export function toRecordedExchange(request: string, reply: string): RecordedExchange {
  return {
    request: { body: request } as RecordedExchange['request'],
    reply: { body: reply } as RecordedExchange['reply'],
  };
}

export class FixtureArtifacts<TVariables> {
  private readonly dir: string;
  private readonly id: string;

  constructor(location: FixtureLocation) {
    this.id = location.exportName;

    const fixtureDir = path.dirname(location.filePath);
    const fixtureFileName = path.basename(location.filePath, '.ts');
    this.dir = path.join(fixtureDir, fixtureFileName);
  }

  private get contextPath(): string {
    return path.join(this.dir, `${this.id}.context.json`);
  }

  private get replyPath(): string {
    return path.join(this.dir, `${this.id}${REPLY_SUFFIX}`);
  }

  private exchangePaths(exchangeId: RecordedExchangeId): { request: string; reply: string } {
    return {
      request: path.join(this.dir, `${this.id}.${exchangeId}${REQUEST_SUFFIX}`),
      reply: path.join(this.dir, `${this.id}.${exchangeId}${REPLY_SUFFIX}`),
    };
  }

  get snapshotPath(): string {
    return path.join(this.dir, `${this.id}.result.json`);
  }

  /**
   * The ids of the recorded exchanges on disk, from their `<scenario>.<id>.request.xml` files.
   */
  async exchangeIds(): Promise<Array<RecordedExchangeId>> {
    if (!existsSync(this.dir)) {
      return [];
    }

    const prefix = `${this.id}.`;
    const files = await fs.readdir(this.dir);
    return files
      .filter((file) => file.startsWith(prefix) && file.endsWith(REQUEST_SUFFIX))
      .map((file) => file.slice(prefix.length, -REQUEST_SUFFIX.length))
      .toSorted();
  }

  async write(contents: FixtureArtifactContents<TVariables>): Promise<void> {
    const { recordedAt, variables } = contents;
    const context: FixtureContext<TVariables> = { meta: { recordedAt }, variables };

    await fs.mkdir(this.dir, { recursive: true });
    await this.removeExchanges();
    await fs.writeFile(this.contextPath, JSON.stringify(context, null, 2));

    if (contents.exchanges === undefined) {
      await fs.writeFile(this.replyPath, contents.reply);
      return;
    }

    await fs.rm(this.replyPath, { force: true });
    for (const [exchangeId, { request, reply }] of Object.entries(contents.exchanges)) {
      const paths = this.exchangePaths(exchangeId);
      await fs.writeFile(paths.request, request.body);
      await fs.writeFile(paths.reply, reply.body);
    }
  }

  async read(): Promise<FixtureArtifactContents<TVariables>> {
    const context = JSON.parse(await readArtifact(this.contextPath)) as FixtureContext<TVariables>;
    const { recordedAt } = context.meta;
    const { variables } = context;

    const exchangeIds = await this.exchangeIds();
    if (exchangeIds.length === 0) {
      return { recordedAt, variables, reply: await readArtifact(this.replyPath) };
    }

    const exchanges: Record<RecordedExchangeId, RecordedExchange> = {};
    for (const exchangeId of exchangeIds) {
      const paths = this.exchangePaths(exchangeId);
      exchanges[exchangeId] = toRecordedExchange(
        await readArtifact(paths.request),
        await readArtifact(paths.reply),
      );
    }

    return { recordedAt, variables, exchanges };
  }

  /**
   * Removes the recorded exchanges left by a previous recording, so that none outlives it.
   */
  private async removeExchanges(): Promise<void> {
    for (const exchangeId of await this.exchangeIds()) {
      const paths = this.exchangePaths(exchangeId);
      await fs.rm(paths.request, { force: true });
      await fs.rm(paths.reply, { force: true });
    }
  }
}

async function readArtifact(filePath: string): Promise<string> {
  if (!existsSync(filePath)) {
    throw new Error(`Fixture artifact missing: ${filePath}`);
  }
  return fs.readFile(filePath, 'utf-8');
}

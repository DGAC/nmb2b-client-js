import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * The contents of a fixture scenario's fixture artifacts: what fixture recording writes and fixture replay reads back.
 */
export interface FixtureArtifactContents<TVariables = unknown> {
  /**
   * When the recording started, just before `setup`. Replay freezes the clock at this date.
   */
  recordedAt: string;
  variables: TVariables;
  /**
   * The raw B2B reply.
   */
  reply: string;
}

interface FixtureContext<TVariables> {
  meta: {
    mockDate: string;
  };
  variables: TVariables;
}

export type FixtureLocation = {
  filePath: string;
  exportName: string;
};

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
    return path.join(this.dir, `${this.id}.mock.xml`);
  }

  get snapshotPath(): string {
    return path.join(this.dir, `${this.id}.result.json`);
  }

  async write({
    recordedAt,
    variables,
    reply,
  }: FixtureArtifactContents<TVariables>): Promise<void> {
    const context: FixtureContext<TVariables> = { meta: { mockDate: recordedAt }, variables };

    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(this.contextPath, JSON.stringify(context, null, 2));
    await fs.writeFile(this.replyPath, reply);
  }

  async read(): Promise<FixtureArtifactContents<TVariables>> {
    const context = JSON.parse(await readArtifact(this.contextPath)) as FixtureContext<TVariables>;
    const reply = await readArtifact(this.replyPath);

    return { recordedAt: context.meta.mockDate, variables: context.variables, reply };
  }
}

async function readArtifact(filePath: string): Promise<string> {
  if (!existsSync(filePath)) {
    throw new Error(`Fixture artifact missing: ${filePath}`);
  }
  return fs.readFile(filePath, 'utf-8');
}

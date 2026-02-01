import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface FixtureContext<TVariables = unknown> {
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

  get contextPath(): string {
    return path.join(this.dir, `${this.id}.context.json`);
  }

  get mockPath(): string {
    return path.join(this.dir, `${this.id}.mock.xml`);
  }

  get snapshotPath(): string {
    return path.join(this.dir, `${this.id}.result.json`);
  }

  private async ensureDirectory(): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true });
  }

  async saveContext(context: FixtureContext<TVariables>): Promise<void> {
    await this.ensureDirectory();
    await fs.writeFile(this.contextPath, JSON.stringify(context, null, 2));
  }

  async readContext(): Promise<FixtureContext<TVariables>> {
    if (!existsSync(this.contextPath)) {
      throw new Error(`Context file missing: ${this.contextPath}`);
    }
    const content = await fs.readFile(this.contextPath, 'utf-8');
    // oxlint-disable-next-line no-unsafe-type-assertion
    return JSON.parse(content) as FixtureContext<TVariables>;
  }

  async saveMock(xml: string): Promise<void> {
    await this.ensureDirectory();
    await fs.writeFile(this.mockPath, xml);
  }

  async readMock(): Promise<string> {
    if (!existsSync(this.mockPath)) {
      throw new Error(`Mock file missing: ${this.mockPath}`);
    }

    return await fs.readFile(this.mockPath, 'utf-8');
  }
}

import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { create as createTar } from 'tar';

/**
 * Boolean to indicate if tests requiring a real connection the NM B2B should
 * be run.
 */
export const shouldUseRealB2BConnection =
  // Disable B2B connections in CI
  !process.env.CI ||
  // ... unless explicity allowed
  !!process.env.REAL_B2B_CONNECTIONS;

export async function createMockArchive(
  files: Record<string, string>,
): Promise<Buffer> {
  const tempDir = await mkdtemp(
    path.join(os.tmpdir(), 'b2b-client-mock-archive-'),
  );

  try {
    for (const [filePath, content] of Object.entries(files)) {
      const absolutePath = path.join(tempDir, filePath);

      // oxlint-disable-next-line no-await-in-loop
      await mkdir(path.dirname(absolutePath), { recursive: true });

      // oxlint-disable-next-line no-await-in-loop
      await writeFile(absolutePath, content);
    }

    const stream = createTar(
      {
        gzip: true,
        cwd: tempDir,
      },
      Object.keys(files),
    );

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

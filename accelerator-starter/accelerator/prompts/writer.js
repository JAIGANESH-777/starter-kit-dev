import fs from 'fs/promises';
import path from 'path';

export async function writeSpec(markdown) {
  const outputPath = path.join(process.cwd(), 'SPEC.md');
  await fs.writeFile(outputPath, markdown, 'utf8');
  return outputPath;
}

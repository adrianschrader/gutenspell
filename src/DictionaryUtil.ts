import * as fs from 'fs';
import * as path from 'path';

// Promisify fs.writeFile(,,)
function writeFile(filePath, data): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

/* A default export is not indicated for Utility modules. The functions are
 * only loosely connected and do not have a hirarchy. */
/* eslint import/prefer-default-export: 0 */

/**
 * Create a new .txt file, otherwise override the existing file, in the project
 * directory and save the words line by line.
 * @param name Filename (.txt extention will be generated automatically)
 * @param words List of all words that should be saved
 */
export async function writeDictionaryFromWords(
  name: string,
  words: string[],
): Promise<void> {
  const filePath = path.join(
    path.resolve(__dirname),
    `${name.normalize()}.dict`,
  );
  const data = words.join('\n').concat('\n');

  await writeFile(filePath, data);
}

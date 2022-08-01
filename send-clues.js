import * as _ from 'lodash-es';

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// import { Low, JSONFile } from 'lowdb';

import { readdir } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function sendClues(client, locations, clueNum) {
  for (const index in locations.data) {
    const channel = client.channels.cache.get(
      locations.data[index].channelId || '985672577655656518'
    );
    const dirFiles = await readdir(
      join(__dirname, './content/locations/' + locations.data[index].foldername + '/')
    );
    const photos = _.filter(dirFiles, (file) => file.includes('.jpeg'));
    if (!photos.includes(`${clueNum}.jpeg`)) {
      continue;
    }
    const message = await channel.send({
      files: [
        join(
          __dirname,
          './content/locations/' + locations.data[index].foldername + `/${clueNum}.jpeg`
        ),
      ],
    });
    // if this is the first clue, create the thread
    if (clueNum === 1) {
      const thread = await message.startThread({
        name: `Location ${parseInt(index) + 1} - ${
          locations.data[index].pointvalue
        } points`,
      });
      locations.data[index].channelId = thread.id;
    }
  }
  await locations.write();
}

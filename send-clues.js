import * as _ from 'lodash-es';
import * as P from 'blend-promise-utils';

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// import { Low, JSONFile } from 'lowdb';

import { readdir } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default async function sendClues(client, locations, clueNum) {
  const messages = await P.mapLimit(locations.data, 20, async function (location, index) {
    const channel = client.channels.cache.get(
      // the thread or #clues
      locations.data[index].channelId || '1005172287630221330'
    );
    const dirFiles = await readdir(
      join(__dirname, './content/locations/' + locations.data[index].foldername + '/')
    );
    const photos = _.filter(dirFiles, (file) => file.includes('.jpeg'));
    if (!photos.includes(`${clueNum}.jpeg`)) {
      return;
    }
    const message = await channel.send({
      files: [
        join(
          __dirname,
          './content/locations/' + locations.data[index].foldername + `/${clueNum}.jpeg`
        ),
      ],
    });
    locations.data[index].messageId = message.id;
    locations.data[index].captured = false;
    return { id: message.id, locationIndex: index, numberOfClues: photos.length };
  });

  await locations.write();

  // if this is the first clue, create the threads
  if (clueNum === 1) {
    await P.mapLimit(messages, 5, async function (message) {
      const thread = await message.startThread({
        name: `Location ${parseInt(message.index) + 1} - ${
          locations.data[message.index].pointvalue
        } points - ${message.numberOfClues} clues`,
      });
      locations.data[message.index].channelId = thread.id;
      // avoid thread creation rate limit
      await sleep(5000);
    });
  } else {
    // if this is not the first clue, send an update message
    const channel = client.channels.cache.get(
      // #clues
      '1005172287630221330'
    );
    await channel.send({
      content: `@everyone Clue batch #${clueNum} has been sent!`,
    });
  }
  await locations.write();
}

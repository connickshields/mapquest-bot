import * as _ from 'lodash-es';
import * as P from 'blend-promise-utils';

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { readdir } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default async function sendClues(client, locations, clueNum) {
  if (clueNum === 1) {
    // use .mapSeries to preserve order
    await P.mapSeries(locations.data, async function (location, index) {
      const clues = await client.channels.fetch(
        // #clues
        '1005250001724780595'
      );
      const dirFiles = await readdir(
        join(__dirname, './content/locations/' + location.foldername + '/')
      );
      const photos = _.filter(dirFiles, (file) => file.includes('.jpeg'));
      if (!photos.includes(`${clueNum}.jpeg`)) {
        return;
      }
      const message = await clues.send({
        files: [
          join(
            __dirname,
            './content/locations/' + location.foldername + `/${clueNum}.jpeg`
          ),
        ],
      });
      locations.data[index].messageId = message.id;
      locations.data[index].captured = false;

      const thread = await message.startThread({
        name: `Location ${parseInt(index) + 1} - ${location.pointvalue} points - ${
          photos.length
        } clues`,
      });
      locations.data[index].channelId = thread.id;
      // avoid thread creation rate limit
      return await sleep(5000);
    });
    await locations.write();
  } else {
    // order is already set so go faaaast
    await P.map(locations.data, async function (location) {
      // don't send additional clues for captured locations
      if (location.captured) {
        return;
      }
      const thread = await client.channels.fetch(
        // the thread
        location.channelId
      );
      const dirFiles = await readdir(
        join(__dirname, './content/locations/' + location.foldername + '/')
      );
      const photos = _.filter(dirFiles, (file) => file.includes('.jpeg'));
      if (!photos.includes(`${clueNum}.jpeg`)) {
        return;
      }
      return await thread.send({
        files: [
          join(
            __dirname,
            './content/locations/' + location.foldername + `/${clueNum}.jpeg`
          ),
        ],
      });
    });
    const clues = await client.channels.fetch(
      // #clues
      '1005250001724780595'
    );
    await clues.send({
      content: `@everyone Clue batch #${clueNum} has been sent!`,
    });
  }
}

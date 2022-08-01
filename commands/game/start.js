import * as _ from 'lodash-es';

import sendClues from '../../send-clues.js';

import { readdir } from 'node:fs/promises';

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function handler(interaction, gameState, locations) {
  // check if the game has started already
  const isStarted = gameState.data.isStarted;
  if (isStarted) {
    return await interaction.reply({
      content: `The game has already been started!`,
      ephemeral: false,
    });
  }
  // start the game
  gameState.data.isStarted = true;
  await interaction.reply({
    content: 'Validating location list file...',
    ephemeral: false,
  });

  const problemMessages = [];
  const validPhotoFileNames = ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg'];
  // make sure that folders for each location actually exist
  // and that each contains properly named photos up to 4
  for (const index in locations.data) {
    // make sure that the location has a name
    if (!locations.data[index].locationname) {
      problemMessages.push(`⚠️ Location \`${index}\` does not have a name defined!`);
      continue;
    }
    // make sure that the location has a point value
    if (!locations.data[index].pointvalue) {
      problemMessages.push(
        `⚠️ \`${locations.data[index].locationname}\` does not have an assigned point value!`
      );
      continue;
    }
    // make sure that the folder is defined
    if (!locations.data[index].foldername) {
      problemMessages.push(
        `⚠️ \`${locations.data[index].locationname}\` does not have a folder name defined!`
      );
      continue;
    }
    // make sure that the folder actually exists on disk
    try {
      const dirFiles = await readdir(
        join(
          __dirname,
          '../../content/locations/' + locations.data[index].foldername + '/'
        )
      );
      const photos = _.filter(dirFiles, (file) => file.includes('.jpeg'));
      // make sure that there is at least 1 photo
      if (photos.length === 0) {
        problemMessages.push(
          `⚠️ \`${locations.data[index].locationname}\` has no photos!`
        );
        continue;
      }
      // make sure that there are a max of 4 photos
      if (photos.length > 4) {
        problemMessages.push(
          `⚠️ \`${locations.data[index].locationname}\` has more than 4 photos!`
        );
        continue;
      }
      if (!_.isEqual(photos, validPhotoFileNames.slice(0, photos.length))) {
        problemMessages.push(
          `⚠️ \`${locations.data[index].locationname}\` has photo naming problems!`
        );
        continue;
      }
    } catch (error) {
      if (error.message.includes('no such file or directory')) {
        problemMessages.push(
          `⚠️ \`${locations.data[index].locationname}\` has no folder on disk!`
        );
      }
    }
  }

  if (problemMessages.length !== 0) {
    let rejectMessage = 'Validating location list file... ❌\n';
    problemMessages.forEach((problem) => {
      rejectMessage += problem + '\n';
    });
    return await interaction.editReply({
      content: rejectMessage,
      ephemeral: false,
    });
  }

  await interaction.editReply({
    content: 'Validating location list file... ✅\nSending photo clues...',
    ephemeral: false,
  });

  await sendClues(interaction.client, locations, 1);

  await interaction.editReply({
    content: 'Validating location list file... ✅\nSending photo clues... ✅',
    ephemeral: false,
  });

  gameState.data.cluesSent = 1;
  await gameState.write();
}

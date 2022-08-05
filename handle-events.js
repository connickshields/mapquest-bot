// import * as _ from 'lodash-es';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { v4 as uuid } from 'uuid';

import openDB from './db.js';

export default async function handleMessageEvent(message) {
  const requests = await openDB('requests', {});
  const locations = await openDB('locations', []);
  const gameState = await openDB('game', {});
  const locationIndex =
    parseInt(message.content.toLowerCase().replace(/[^0-9.]/g, ''), 10) - 1;
  const userId = message.author.id;
  // make sure the game is started, the index is not OOB, and the location
  // hasn't been captured already
  if (!gameState.data.isStarted) {
    await message.channel.send(`<@${userId}> There is no active game!`);
    return await message.delete();
  } else if (locationIndex > locations.data.length - 1) {
    await message.channel.send(`<@${userId}> Invalid location ID, please re-send!`);
    return await message.delete();
  } else if (locations.data[locationIndex].captured) {
    await message.channel.send(`<@${userId}> This location has already been captured!`);
    return await message.delete();
  }

  const requestId = uuid();

  requests.data.requests[requestId] = {
    userId,
    messageId: message.id,
    locationIndex,
  };

  const row = new ActionRowBuilder();
  row.addComponents(
    new ButtonBuilder()
      .setCustomId(requestId + ':approve')
      .setLabel('Approve')
      .setStyle(ButtonStyle.Success)
  );
  row.addComponents(
    new ButtonBuilder()
      .setCustomId(requestId + ':reject')
      .setLabel('Reject')
      .setStyle(ButtonStyle.Danger)
  );
  const channel = message.client.channels.cache.get(
    // #admin
    '998443048751083672'
  );
  await channel.send({
    content: `New capture request: ${message.url}`,
    components: [row],
  });
  return await requests.write();
}

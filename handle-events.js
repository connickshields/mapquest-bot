import * as _ from 'lodash-es';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { v4 as uuid } from 'uuid';

import openDB from './db.js';
import sendLeaderboard from './send-leaderboard.js';

async function handleMessageEvent(message) {
  const requestsDb = await openDB('requests', {});
  const locationsDb = await openDB('locations', []);
  const gameStateDb = await openDB('game', {});
  const teamsDb = await openDB('teams', []);

  const userId = message.author.id;

  // make sure whoever sent the message is in a team
  let isInTeam = false;
  for (const team of teamsDb.data) {
    if (team.members.includes(userId)) {
      isInTeam = true;
    }
  }

  if (!isInTeam) {
    return;
  }

  const locationIndex =
    parseInt(message.content.toLowerCase().replace(/[^0-9.]/g, ''), 10) - 1;

  // make sure the game is started, the index is not OOB, and the location
  // hasn't been captured already
  if (!gameStateDb.data.isStarted) {
    await message.channel.send(`<@${userId}> There is no active game!`);
    return await message.delete();
  } else if (locationIndex > locationsDb.data.length - 1) {
    await message.channel.send(`<@${userId}> Invalid location ID, please re-send!`);
    return await message.delete();
  } else if (locationsDb.data[locationIndex].captured) {
    await message.channel.send(`<@${userId}> This location has already been captured!`);
    return await message.delete();
  } else if (message.attachments.size !== 1) {
    await message.channel.send(`<@${userId}> No photo was uploaded!`);
    return await message.delete();
  }

  const requestId = uuid();
  const [attachment] = message.attachments.values();

  requestsDb.data[requestId] = {
    userId,
    messageId: message.id,
    locationIndex,
  };

  // the approve / reject buttons
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

  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setURL(message.url)
    .addFields(
      { name: 'Player', value: `<@${userId}>`, inline: true },
      {
        name: 'Location',
        value: locationsDb.data[locationIndex].locationname,
        inline: true,
      }
    )
    .setImage(attachment.url);

  const admin = await message.client.channels.fetch(
    // #admin
    '998443048751083672'
  );
  await admin.send({
    content: `@everyone New capture request:`,
    components: [row],
    embeds: [embed],
  });
  return await requestsDb.write();
}

async function handleButtonEvent(interaction) {
  if (
    !interaction.customId.includes('approve') &&
    !interaction.customId.includes('reject')
  ) {
    return await interaction.reply('Non-bot created interaction');
  }

  const [requestId, action] = interaction.customId.split(':');

  const requestsDb = await openDB('requests', {});
  const locationsDb = await openDB('locations', []);
  const teamsDb = await openDB('teams', []);

  const request = requestsDb.data[requestId];

  if (_.isNil(request)) {
    return await interaction.reply('Original request not found');
  }

  const captures = await interaction.client.channels.fetch(
    // #captures
    '985693820454838272'
  );
  const originalMessage = await captures.messages.fetch(request.messageId);

  if (action === 'approve') {
    const clues = await interaction.client.channels.fetch(
      // #clues
      '1005250001724780595'
    );
    await clues.messages.delete(locationsDb.data[request.locationIndex].messageId);
    const locationThread = await interaction.client.channels.fetch(
      // clue thread for the location
      locationsDb.data[request.locationIndex].channelId
    );
    await locationThread.delete();

    const originalMessage = await captures.messages.fetch(request.messageId);
    locationsDb.data[request.locationIndex].captured = true;
    const team = _.find(
      teamsDb.data,
      (team) => team.members.indexOf(request.userId) !== -1
    );
    await originalMessage.reply(
      `Team \`${team.name}\` captured Location ${parseInt(request.locationIndex) + 1}`
    );
    team.score += locationsDb.data[request.locationIndex].pointvalue;
    await sendLeaderboard(interaction.client, teamsDb, {
      teamName: team.name,
      points: locationsDb.data[request.locationIndex].pointvalue,
      locationName: locationsDb.data[request.locationIndex].locationname,
      locationIndex: request.locationIndex,
    });
  } else {
    // delete the original capture message
    await originalMessage.delete();
    await captures.send(
      `<@${request.userId}> Your capture request for Location ${
        parseInt(request.locationIndex) + 1
      } was rejected. Please try again.`
    );
  }
  delete requestsDb.data[requestId];

  // write out to the DBs
  await requestsDb.write();
  await teamsDb.write();
  await locationsDb.write();

  return await interaction.update({
    content: `The following request was ${
      action === 'approve' ? 'approved' : 'rejected'
    }:`,
    components: [],
  });
}

export { handleButtonEvent, handleMessageEvent };

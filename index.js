import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { InteractionType } from 'discord-api-types/v10';
import config from './config.js';
import deploy from './deploy-commands.js';

import { handleMessageEvent, handleButtonEvent } from './handle-events.js';

import game from './commands/game/index.js';
import teams from './commands/teams/index.js';
const commands = [game, teams];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

commands.forEach(async (command) => {
  client.commands.set(command.data.name, command);
});

client.once('ready', async () => {
  await deploy(config, commands);
  console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.type !== InteractionType.ApplicationCommand) {
    return;
  }
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return;
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.type !== InteractionType.MessageComponent) {
    return;
  }
  await handleButtonEvent(interaction);
});

client.on('messageCreate', async (message) => {
  if (
    // #captures
    message.channelId === '985693820454838272' &&
    message.content.toLowerCase().includes('location')
  ) {
    await handleMessageEvent(message);
  }
});

client.login(config.token);

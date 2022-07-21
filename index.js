import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { InteractionType } from 'discord-api-types/v10';
import config from './config.js';

import game from './commands/game.js';
import teams from './commands/teams/index.js';
const commands = [game, teams];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

commands.forEach(async (command) => {
  client.commands.set(command.data.name, command);
});

client.once('ready', () => {
  console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.type !== InteractionType.ApplicationCommand) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

client.login(config.token);

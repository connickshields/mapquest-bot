import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

import config from './config.js';

import game from './commands/game.js';
import teams from './commands/teams/index.js';
const commandHandlers = [game, teams];

const commands = [];

for (const command of commandHandlers) {
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

rest
  .put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
    body: commands,
  })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);

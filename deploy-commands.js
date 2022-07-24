import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

export default async function deployCommands(config, commandHandlers) {
  const commands = [];

  for (const command of commandHandlers) {
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
      body: commands,
    });
  } catch (error) {
    console.log(error);
  }
  console.log('Successfully registered application commands.');
}

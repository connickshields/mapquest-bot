import { SlashCommandBuilder } from 'discord.js';

import openDB from '../../db.js';

import start from './start.js';
// import end from './end.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('game')
    .setDescription('Manage a MapQuest game session.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('start')
        .setDescription('Starts the game by sending initial hints.')
    ),
  // .addSubcommand((subcommand) =>
  //   subcommand.setName('end').setDescription('Ends the game. Calculates winner too!')
  // ),
  async execute(interaction) {
    const gameStateDb = await openDB('game', {});
    const locationsDb = await openDB('locations', []);
    if (interaction.options.getSubcommand() === 'start') {
      return await start(interaction, gameStateDb, locationsDb);
    }
    // if (interaction.options.getSubcommand() === 'end') {
    //   return await end(interaction, db);
    // }
  },
};

export default command;

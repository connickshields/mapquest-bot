import { SlashCommandBuilder } from 'discord.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('game')
    .setDescription('Sends initial clues and sets up the leaderboard.'),
  async execute(interaction) {
    // load the initial photos / send them
    return await interaction.reply({
      content: `Loading location information into the DB.`,
      ephemeral: true,
    });
    // create a leaderboard with teams
    // send leaderboard to channel
    // set up filesystem to track
  },
};

export default command;

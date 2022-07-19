const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start-game')
    .setDescription('Sends initial clues and sets up the leaderboard.'),
  async execute(interaction) {
    // load the initial photos / send them
    // create a leaderboard with teams
    // send leaderboard to channel
    // set up filesystem to track
    await interaction.reply({
      content: `Sending initial clues and setting up the leaderboard!`,
      ephemeral: true,
    });
  },
};

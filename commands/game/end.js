import openDB from '../../db.js';
import sendLeaderboard from '../../send-leaderboard.js';

export default async function handler(interaction, gameState) {
  // make sure a game is in progress
  const isStarted = gameState.data.isStarted;
  if (!isStarted) {
    return await interaction.reply({
      content: `There is no game in progress!`,
      ephemeral: false,
    });
  }
  // start the game
  gameState.data.isStarted = false;
  await interaction.reply({
    content: 'Sending final scores...',
    ephemeral: false,
  });

  const teamsDb = await openDB('teams', []);

  await sendLeaderboard(interaction.client, teamsDb, { end: true });

  await interaction.editReply({
    content: 'Sending final scores... ✅\n',
    ephemeral: false,
  });

  await gameState.write();
}

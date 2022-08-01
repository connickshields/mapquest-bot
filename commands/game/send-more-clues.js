import sendClues from '../../send-clues.js';

export default async function handler(interaction, gameState, locations) {
  // check if the game has started already
  const isStarted = gameState.data.isStarted;
  if (!isStarted) {
    return await interaction.reply({
      content: `There is no game in progress!`,
      ephemeral: false,
    });
  }

  const batch = gameState.data.cluesSent + 1;

  await interaction.reply({
    content: `Sending photo clue batch number ${batch}...`,
    ephemeral: false,
  });

  await sendClues(interaction.client, locations, batch);

  await interaction.editReply({
    content: `Sending photo clue batch number ${batch}... ✅`,
    ephemeral: false,
  });

  gameState.data.cluesSent = batch;
  await gameState.write();
}

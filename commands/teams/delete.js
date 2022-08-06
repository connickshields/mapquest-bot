import * as _ from 'lodash-es';

export default async function handler(interaction, db) {
  const teamName = interaction.options.getString('name');
  const teamIndex = _.findIndex(db.data, ['name', teamName]);
  if (teamIndex === -1) {
    return await interaction.reply({
      content: `A team called \`${teamName}\` does not exist!`,
      ephemeral: false,
    });
  } else {
    db.data.splice(teamIndex, 1);
    await db.write();
    return await interaction.reply({
      content: `Deleted the team called \`${teamName}\`!`,
      ephemeral: false,
    });
  }
}

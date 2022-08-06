import * as _ from 'lodash-es';

export default async function handler(interaction, db) {
  const teamName = interaction.options.getString('name');
  const team = _.find(db.data, ['name', teamName]);
  if (team) {
    return await interaction.reply({
      content: `A team called \`${teamName}\` already exists!`,
      ephemeral: false,
    });
  } else {
    db.data.push({
      name: teamName,
      members: [],
      captain: null,
      score: 0,
    });
    await db.write();
    return await interaction.reply({
      content: `Created a new team called \`${teamName}\`!`,
      ephemeral: false,
    });
  }
}

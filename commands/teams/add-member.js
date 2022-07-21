import * as _ from 'lodash-es';

export default async function handler(interaction, db) {
  const teamName = interaction.options.getString('name');
  const user = interaction.options.getUser('target');
  const teamIndex = _.findIndex(db.data.teams, ['name', teamName]);
  if (teamIndex === -1) {
    return await interaction.reply({
      content: `A team called \`${teamName}\` does not exist!`,
      ephemeral: false,
    });
  }
  for (const team of db.data.teams) {
    if (team.members.includes(user.id)) {
      return await interaction.reply({
        content: `<@${user.id}> is already on team \`${team.name}\`!`,
        ephemeral: false,
      });
    }
  }
  db.data.teams[teamIndex].members.push(user.id);
  await db.write();
  return await interaction.reply({
    content: `Added <@${user.id}> to team \`${teamName}\`!`,
    ephemeral: false,
  });
}

import * as _ from 'lodash-es';

export default async function handler(interaction, db) {
  const teamName = interaction.options.getString('name');
  const user = interaction.options.getUser('target');
  const teamIndex = _.findIndex(db.data, ['name', teamName]);
  if (teamIndex === -1) {
    return await interaction.reply({
      content: `A team called \`${teamName}\` does not exist!`,
      ephemeral: false,
    });
  }
  if (!db.data[teamIndex].members.includes(user.id)) {
    return await interaction.reply({
      content: `<@${user.id}> is not on team \`${db.data[teamIndex].name}\`!`,
      ephemeral: false,
    });
  }
  const userIndex = _.findIndex(db.data[teamIndex].members, user.id);
  db.data[teamIndex].members.splice(userIndex, 1);
  await db.write();
  return await interaction.reply({
    content: `Removed <@${user.id}> from team \`${teamName}\`!`,
    ephemeral: false,
  });
}

import * as _ from 'lodash-es';

export default async function handler(interaction, db) {
  if (db.data.length === 0) {
    return await interaction.reply({
      content: 'No teams yet!',
      ephemeral: false,
    });
  } else {
    let returnString = '';
    db.data.forEach((team) => {
      returnString += `**Team Name**: \`${team.name}\` - **Captain**: ${
        team.captain ? `<@${team.captain}>` : 'Not selected'
      }\n*Members*: ${
        team.members.length > 0
          ? _.map(team.members, (member) => {
              return `<@${member}>`;
            })
          : 'None yet!'
      }\n`;
    });
    return await interaction.reply({
      content: returnString,
      ephemeral: false,
    });
  }
}

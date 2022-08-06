import * as _ from 'lodash-es';

export default async function sendLeaderboard(client, teams, options) {
  const leaderboard = await client.channels.fetch(
    // #leaderboard
    '985672688615960606'
  );
  if (teams.data.length === 0) {
    return await leaderboard.send({
      content: 'There are no teams defined!',
    });
  } else {
    const header = '**Place**  |  **Team Name**  |  **Score**\n';
    let returnString = options.end
      ? `@everyone The game has ended. Here are the final scores:\n${header}`
      : `@everyone Team \`${options.teamName}\` has scored ${
          options.points
        } points by capturing \`${options.locationName}\` (Location #\`${
          parseInt(options.locationIndex) + 1
        }\`). Current scores:\n${header}`;
    let index = 1;
    for (const team of _.orderBy(teams.data, 'score', 'desc')) {
      returnString += `   ${index}    |  ${team.name}      |  ${team.score}\n`;
      index++;
    }
    return await leaderboard.send({
      content: returnString,
    });
  }
}

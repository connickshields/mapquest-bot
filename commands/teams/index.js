import { SlashCommandBuilder } from 'discord.js';

import openDB from '../../db.js';

import create from './create.js';
import deleteTeam from './delete.js';
import list from './list.js';
import addMember from './add-member.js';
import removeMember from './remove-member.js';
import setCaptain from './set-captain.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('teams')
    .setDescription('Create, modify and delete teams.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Create a team.')
        .addStringOption((option) =>
          option.setName('name').setDescription('The name of the team').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Delete a team.')
        .addStringOption((option) =>
          option.setName('name').setDescription('The name of the team').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('List all teams.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add-member')
        .setDescription('Add a member to a team.')
        .addStringOption((option) =>
          option.setName('name').setDescription('The name of the team').setRequired(true)
        )
        .addUserOption((option) =>
          option.setName('target').setDescription('The user to add').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove-member')
        .setDescription('Remove a member from a team.')
        .addStringOption((option) =>
          option.setName('name').setDescription('The name of the team').setRequired(true)
        )
        .addUserOption((option) =>
          option.setName('target').setDescription('The user to remove').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('set-captain')
        .setDescription('Set the captain of a team.')
        .addStringOption((option) =>
          option.setName('name').setDescription('The name of the team').setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName('target')
            .setDescription('The user to be the captain')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    const db = await openDB('teams', []);
    if (interaction.options.getSubcommand() === 'create') {
      return await create(interaction, db);
    }
    if (interaction.options.getSubcommand() === 'delete') {
      return await deleteTeam(interaction, db);
    }
    if (interaction.options.getSubcommand() === 'list') {
      return await list(interaction, db);
    }
    if (interaction.options.getSubcommand() === 'add-member') {
      return await addMember(interaction, db);
    }
    if (interaction.options.getSubcommand() === 'remove-member') {
      return await removeMember(interaction, db);
    }
    if (interaction.options.getSubcommand() === 'set-captain') {
      return await setCaptain(interaction, db);
    }
  },
};

export default command;

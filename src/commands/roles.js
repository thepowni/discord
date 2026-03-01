const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Detailed role management')
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription('Create a new role')
				.addStringOption(option => option.setName('name').setDescription('Role name').setRequired(true))
				.addStringOption(option => option.setName('color').setDescription('Hex color (e.g. #FF0000)')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('give')
				.setDescription('Give a role to a member')
				.addUserOption(option => option.setName('user').setDescription('The member').setRequired(true))
				.addRoleOption(option => option.setName('role').setDescription('The role').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('edit')
				.setDescription('Edit an existing role')
				.addRoleOption(option => option.setName('role').setDescription('The role to edit').setRequired(true))
				.addStringOption(option => option.setName('name').setDescription('New name'))
				.addStringOption(option => option.setName('color').setDescription('New hex color'))
				.addBooleanOption(option => option.setName('hoist').setDescription('Display separately'))
				.addBooleanOption(option => option.setName('mentionable').setDescription('Allow mentions')))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const embed = new EmbedBuilder().setColor('Blue').setTimestamp();

		if (subcommand === 'create') {
			const name = interaction.options.getString('name');
			const color = interaction.options.getString('color') || '#000000';
			const role = await interaction.guild.roles.create({ name, color, reason: `Created by ${interaction.user.tag}` });
			embed.setTitle('Role Created').setDescription(`Successfully created role: ${role}`);
			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'give') {
			const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id);
			const role = interaction.options.getRole('role');
			await member.roles.add(role);
			embed.setTitle('Role Given').setDescription(`Gave ${role} to ${member}`);
			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'edit') {
			const role = interaction.options.getRole('role');
			const name = interaction.options.getString('name');
			const color = interaction.options.getString('color');
			const hoist = interaction.options.getBoolean('hoist');
			const mentionable = interaction.options.getBoolean('mentionable');

			const options = {};
			if (name) options.name = name;
			if (color) options.color = color;
			if (hoist !== null) options.hoist = hoist;
			if (mentionable !== null) options.mentionable = mentionable;

			await role.edit(options);
			embed.setTitle('Role Edited').setDescription(`Successfully updated role: ${role}`);
			return interaction.reply({ embeds: [embed] });
		}
	},
};

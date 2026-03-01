const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('utility')
		.setDescription('Utility commands')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add-emoji')
				.setDescription('Add an emoji from a URL')
				.addStringOption(option => option.setName('name').setDescription('Name for the emoji').setRequired(true))
				.addStringOption(option => option.setName('url').setDescription('URL of the image').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('add-sticker')
				.setDescription('Add a sticker from a URL')
				.addStringOption(option => option.setName('name').setDescription('Name for the sticker').setRequired(true))
				.addStringOption(option => option.setName('url').setDescription('URL of the image (PNG/APNG/512x512)').setRequired(true))
                .addStringOption(option => option.setName('description').setDescription('Description for the sticker').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('role')
				.setDescription('Role management')
				.addStringOption(option =>
					option.setName('action')
						.setDescription('Action to perform')
						.setRequired(true)
						.addChoices(
							{ name: 'Create', value: 'create' },
							{ name: 'Give', value: 'give' },
						))
				.addStringOption(option => option.setName('name').setDescription('Role name (for create)'))
				.addUserOption(option => option.setName('user').setDescription('User (for give)'))
				.addRoleOption(option => option.setName('role').setDescription('Role (for give)')))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const embed = new EmbedBuilder().setColor('Blue').setTimestamp();

		if (subcommand === 'add-emoji') {
			const name = interaction.options.getString('name');
			const url = interaction.options.getString('url');
			try {
				const emoji = await interaction.guild.emojis.create({ attachment: url, name: name });
				embed.setTitle('Emoji Added').setDescription(`Successfully added emoji: ${emoji}`);
				return interaction.reply({ embeds: [embed] });
			} catch (e) {
				return interaction.reply({ content: `Error adding emoji: ${e.message}`, ephemeral: true });
			}
		}

		if (subcommand === 'add-sticker') {
			const name = interaction.options.getString('name');
			const url = interaction.options.getString('url');
            const description = interaction.options.getString('description');
			try {
				const sticker = await interaction.guild.stickers.create({ file: url, name: name, description: description, tags: 'bot' });
				embed.setTitle('Sticker Added').setDescription(`Successfully added sticker: ${sticker.name}`);
				return interaction.reply({ embeds: [embed] });
			} catch (e) {
				return interaction.reply({ content: `Error adding sticker: ${e.message}. Ensure the URL is valid and satisfies Discord's requirements (PNG/APNG, <512KB, 512x512).`, ephemeral: true });
			}
		}

		if (subcommand === 'role') {
			const action = interaction.options.getString('action');
			if (action === 'create') {
				const name = interaction.options.getString('name');
				if (!name) return interaction.reply({ content: 'Please provide a role name.', ephemeral: true });
				const role = await interaction.guild.roles.create({ name: name, reason: `Created by ${interaction.user.tag}` });
				embed.setTitle('Role Created').setDescription(`Successfully created role: ${role}`);
				return interaction.reply({ embeds: [embed] });
			}
			if (action === 'give') {
				const user = interaction.options.getMember('user');
				const role = interaction.options.getRole('role');
				if (!user || !role) return interaction.reply({ content: 'Please provide both a user and a role.', ephemeral: true });
				await user.roles.add(role);
				embed.setTitle('Role Given').setDescription(`Successfully gave ${role} to ${user}`);
				return interaction.reply({ embeds: [embed] });
			}
		}
	},
};

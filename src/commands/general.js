const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('general')
		.setDescription('General & Utility commands')
		.addSubcommand(subcommand => subcommand.setName('ping').setDescription('Check bot latency'))
		.addSubcommand(subcommand => subcommand.setName('serverinfo').setDescription('Get server information'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('userinfo')
				.setDescription('Get user information')
				.addUserOption(option => option.setName('target').setDescription('The user')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('avatar')
				.setDescription('Get user avatar')
				.addUserOption(option => option.setName('target').setDescription('The user')))
		.addSubcommand(subcommand => subcommand.setName('membercount').setDescription('Get server member count'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('add-emoji')
				.setDescription('Add an emoji from a URL')
				.addStringOption(option => option.setName('name').setDescription('Emoji name').setRequired(true))
				.addStringOption(option => option.setName('url').setDescription('Emoji URL').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('add-sticker')
				.setDescription('Add a sticker from a URL')
				.addStringOption(option => option.setName('name').setDescription('Sticker name').setRequired(true))
				.addStringOption(option => option.setName('url').setDescription('URL (PNG/APNG/512x512)').setRequired(true))
				.addStringOption(option => option.setName('description').setDescription('Description').setRequired(true))),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const embed = new EmbedBuilder().setColor('Blue').setTimestamp();

		if (subcommand === 'ping') {
			return interaction.reply(`Pong! Latency: ${interaction.client.ws.ping}ms`);
		}

		if (subcommand === 'serverinfo') {
			const { guild } = interaction;
			embed.setTitle(`Server Info - ${guild.name}`).setThumbnail(guild.iconURL()).addFields(
				{ name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
				{ name: 'Members', value: `${guild.memberCount}`, inline: true },
				{ name: 'Created At', value: `${guild.createdAt.toDateString()}`, inline: true },
			);
			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'userinfo') {
			const target = interaction.options.getUser('target') || interaction.user;
			const member = await interaction.guild.members.fetch(target.id);
			embed.setTitle(`User Info - ${target.tag}`).setThumbnail(target.displayAvatarURL()).addFields(
				{ name: 'ID', value: target.id, inline: true },
				{ name: 'Joined Server', value: member.joinedAt.toDateString(), inline: true },
				{ name: 'Joined Discord', value: target.createdAt.toDateString(), inline: true },
			);
			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'avatar') {
			const target = interaction.options.getUser('target') || interaction.user;
			embed.setTitle(`${target.tag}'s Avatar`).setImage(target.displayAvatarURL({ size: 1024 }));
			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'membercount') {
			embed.setTitle('Member Count').setDescription(`This server has **${interaction.guild.memberCount}** members.`);
			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'add-emoji') {
			if (!interaction.member.permissions.has(PermissionFlagsBits.ManageExpressions)) return interaction.reply({ content: 'No permission!', ephemeral: true });
			const name = interaction.options.getString('name');
			const url = interaction.options.getString('url');
			const emoji = await interaction.guild.emojis.create({ attachment: url, name: name });
			embed.setTitle('Emoji Added').setDescription(`Added emoji: ${emoji}`);
			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'add-sticker') {
			if (!interaction.member.permissions.has(PermissionFlagsBits.ManageExpressions)) return interaction.reply({ content: 'No permission!', ephemeral: true });
			const name = interaction.options.getString('name');
			const url = interaction.options.getString('url');
			const description = interaction.options.getString('description');
			const sticker = await interaction.guild.stickers.create({ file: url, name: name, description: description, tags: 'bot' });
			embed.setTitle('Sticker Added').setDescription(`Added sticker: ${sticker.name}`);
			return interaction.reply({ embeds: [embed] });
		}
	},
};

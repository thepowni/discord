const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('General information commands')
		.addSubcommand(subcommand => subcommand.setName('ping').setDescription('Check bot latency'))
		.addSubcommand(subcommand => subcommand.setName('server').setDescription('Get server info'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Get user info')
				.addUserOption(option => option.setName('target').setDescription('The user to get info for')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('avatar')
				.setDescription('Get user avatar')
				.addUserOption(option => option.setName('target').setDescription('The user to get avatar for'))),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const embed = new EmbedBuilder().setColor('Blue').setTimestamp();

		if (subcommand === 'ping') {
			return interaction.reply(`Pong! Latency: ${interaction.client.ws.ping}ms`);
		}

		if (subcommand === 'server') {
			const { guild } = interaction;
			embed.setTitle(`Server Info - ${guild.name}`)
				.setThumbnail(guild.iconURL())
				.addFields(
					{ name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
					{ name: 'Members', value: `${guild.memberCount}`, inline: true },
					{ name: 'Created At', value: `${guild.createdAt.toDateString()}`, inline: true },
				);
			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'user') {
			const target = interaction.options.getUser('target') || interaction.user;
			const member = await interaction.guild.members.fetch(target.id);
			embed.setTitle(`User Info - ${target.tag}`)
				.setThumbnail(target.displayAvatarURL())
				.addFields(
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
	},
};

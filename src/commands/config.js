const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const { updateGuildData } = require('../utils/dataManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('Configuration commands')
		.addSubcommand(subcommand =>
			subcommand
				.setName('welcome')
				.setDescription('Configure welcome message')
				.addChannelOption(option => option.setName('channel').setDescription('The channel for welcome messages').addChannelTypes(ChannelType.GuildText).setRequired(true))
				.addStringOption(option => option.setName('message').setDescription('The welcome message. Use {member} for mention.')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('security')
				.setDescription('Toggle security features')
				.addStringOption(option =>
					option.setName('feature')
						.setDescription('The feature to toggle')
						.setRequired(true)
						.addChoices(
							{ name: 'Anti-Spam', value: 'antiSpam' },
							{ name: 'Anti-Link', value: 'antiLink' },
						))
				.addBooleanOption(option => option.setName('enabled').setDescription('Enable or disable the feature').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('voice')
				.setDescription('Setup temporary voice channels')
				.addChannelOption(option => option.setName('interface').setDescription('The "Join to Create" channel').addChannelTypes(ChannelType.GuildVoice).setRequired(true))
				.addChannelOption(option => option.setName('category').setDescription('The category for temp channels').addChannelTypes(ChannelType.GuildCategory)))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const embed = new EmbedBuilder().setColor('Green').setTimestamp();

		if (subcommand === 'welcome') {
			const channel = interaction.options.getChannel('channel');
			const message = interaction.options.getString('message') || 'Welcome to the server, {member}!';
			updateGuildData(interaction.guild.id, 'greetChannel', channel.id);
			updateGuildData(interaction.guild.id, 'greetMessage', message);
			embed.setTitle('Welcome Configured').setDescription(`Channel: ${channel}\nMessage: ${message}`);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		if (subcommand === 'security') {
			const feature = interaction.options.getString('feature');
			const enabled = interaction.options.getBoolean('enabled');
			const data = require('../utils/dataManager').getGuildData(interaction.guild.id);
			data.security[feature] = enabled;
			updateGuildData(interaction.guild.id, 'security', data.security);
			embed.setTitle('Security Updated').setDescription(`${feature} is now ${enabled ? 'enabled' : 'disabled'}.`);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		if (subcommand === 'voice') {
			const interfaceChannel = interaction.options.getChannel('interface');
			const category = interaction.options.getChannel('category');
			updateGuildData(interaction.guild.id, 'voiceSettings', {
				categoryId: category ? category.id : null,
				interfaceChannelId: interfaceChannel.id,
			});
			embed.setTitle('Voice Setup Complete').setDescription(`Interface: ${interfaceChannel}\nCategory: ${category || 'None'}`);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}
	},
};

const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const { updateGuildData, getGuildData } = require('../utils/dataManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('Bot configuration')
		.addSubcommand(subcommand =>
			subcommand
				.setName('welcome')
				.setDescription('Configure welcome system')
				.addChannelOption(option => option.setName('channel').setDescription('Greeting channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
				.addStringOption(option => option.setName('message').setDescription('Message ({member} to mention)')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('security')
				.setDescription('Toggle security features')
				.addStringOption(option =>
					option.setName('feature')
						.setDescription('Feature to toggle')
						.setRequired(true)
						.addChoices(
							{ name: 'Anti-Spam', value: 'antiSpam' },
							{ name: 'Anti-Link', value: 'antiLink' },
						))
				.addBooleanOption(option => option.setName('enabled').setDescription('Enable/Disable').setRequired(true)))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const embed = new EmbedBuilder().setColor('Green').setTimestamp();

		if (subcommand === 'welcome') {
			const channel = interaction.options.getChannel('channel');
			const message = interaction.options.getString('message') || 'Welcome, {member}!';
			await updateGuildData(interaction.guild.id, 'greetChannel', channel.id);
			await updateGuildData(interaction.guild.id, 'greetMessage', message);
			embed.setTitle('Welcome Updated').setDescription(`Channel: ${channel}\nMessage: ${message}`);
			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'security') {
			const feature = interaction.options.getString('feature');
			const enabled = interaction.options.getBoolean('enabled');
			const data = await getGuildData(interaction.guild.id);
			data.security[feature] = enabled;
			await updateGuildData(interaction.guild.id, 'security', data.security);
			embed.setTitle('Security Updated').setDescription(`${feature} is now ${enabled ? 'ENABLED' : 'DISABLED'}.`);
			return interaction.reply({ embeds: [embed] });
		}
	},
};

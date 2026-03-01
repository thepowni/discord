const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { updateGuildData } = require('../utils/dataManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('voicesetup')
		.setDescription('Setup the advanced voice system')
		.addChannelOption(option => option.setName('interface').setDescription('The "Join to Create" channel').addChannelTypes(ChannelType.GuildVoice).setRequired(true))
		.addChannelOption(option => option.setName('category').setDescription('The category for temp channels').addChannelTypes(ChannelType.GuildCategory))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const interfaceChannel = interaction.options.getChannel('interface');
		const category = interaction.options.getChannel('category');

		updateGuildData(interaction.guild.id, 'voiceSettings', {
			categoryId: category ? category.id : null,
			interfaceChannelId: interfaceChannel.id,
		});

		const embed = new EmbedBuilder()
			.setTitle('Voice Control Panel')
			.setDescription('Use the buttons below to manage your temporary voice channel!')
			.setColor('Blue')
			.addFields(
				{ name: '🔒 Lock/Unlock', value: 'Control who can join your channel', inline: true },
				{ name: '🔇 Mute/Unmute', value: 'Toggle speaker permissions for everyone', inline: true },
			);

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder().setCustomId('voice_lock').setLabel('Lock').setStyle(ButtonStyle.Danger),
				new ButtonBuilder().setCustomId('voice_unlock').setLabel('Unlock').setStyle(ButtonStyle.Success),
				new ButtonBuilder().setCustomId('voice_mute').setLabel('Mute/Unmute All').setStyle(ButtonStyle.Secondary),
			);

		await interaction.reply({
            content: `Voice setup complete! Users can join ${interfaceChannel} to create a channel.`,
            embeds: [embed],
            components: [row]
        });
	},
};

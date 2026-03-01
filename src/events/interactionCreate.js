const { Events, EmbedBuilder } = require('discord.js');
const { getGuildData, updateGuildData } = require('../utils/dataManager');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) return;
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		} else if (interaction.isButton()) {
			// Voice Control Panel Button Handlers
			const data = await getGuildData(interaction.guild.id);
			const tempChannels = data.tempChannels || {};
			const channelId = tempChannels[interaction.user.id];

			if (!channelId || interaction.member.voice.channelId !== channelId) {
				return interaction.reply({ content: 'You are not the owner of this voice channel or not in it!', ephemeral: true });
			}

			const channel = interaction.guild.channels.cache.get(channelId);
			if (!channel) return;

			const embed = new EmbedBuilder().setColor('Blue').setTimestamp();

			if (interaction.customId === 'voice_lock') {
				await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: false });
				embed.setTitle('Channel Locked').setDescription('Users can no longer connect to this channel.');
				await interaction.reply({ embeds: [embed], ephemeral: true });
			} else if (interaction.customId === 'voice_unlock') {
				await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: true });
				embed.setTitle('Channel Unlocked').setDescription('Users can now connect to this channel.');
				await interaction.reply({ embeds: [embed], ephemeral: true });
			} else if (interaction.customId === 'voice_mute') {
                // Toggle mute for everyone in the channel except owner
                const isMuted = channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id)?.deny.has('Speak');
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Speak: isMuted ? true : false });
                embed.setTitle(isMuted ? 'Channel Unmuted' : 'Channel Muted').setDescription(isMuted ? 'Users can now speak.' : 'Users are now muted.');
                await interaction.reply({ embeds: [embed], ephemeral: true });
			}
		}
	},
};

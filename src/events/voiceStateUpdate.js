const { Events, ChannelType, PermissionFlagsBits } = require('discord.js');
const { getGuildData, updateGuildData } = require('../utils/dataManager');

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {
		const { member, guild } = newState;
		const data = await getGuildData(guild.id);
		const { voiceSettings } = data;
        const tempChannels = data.tempChannels || {};

		if (!voiceSettings.interfaceChannelId) return;

		// Join to create
		if (newState.channelId === voiceSettings.interfaceChannelId) {
			const category = guild.channels.cache.get(voiceSettings.categoryId);
			const channel = await guild.channels.create({
				name: `${member.displayName}'s Room`,
				type: ChannelType.GuildVoice,
				parent: category || null,
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers, PermissionFlagsBits.MoveMembers],
                    }
                ]
			});

			await member.voice.setChannel(channel);
			tempChannels[member.id] = channel.id;
            await updateGuildData(guild.id, 'tempChannels', tempChannels);
		}

		// Cleanup empty temporary channels (regardless of where the user moved to)
		if (oldState.channelId && oldState.channelId !== newState.channelId) {
            const channel = oldState.channel;
            // Check if this channel is in our temporary channels list
            if (Object.values(tempChannels).includes(channel.id)) {
                if (channel.members.size === 0) {
                    await channel.delete().catch(() => {});
                    // Clean up data
                    const ownerId = Object.keys(tempChannels).find(key => tempChannels[key] === channel.id);
                    if (ownerId) delete tempChannels[ownerId];
                    await updateGuildData(guild.id, 'tempChannels', tempChannels);
                }
            }
		}
	},
};

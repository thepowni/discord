const { Events, ChannelType } = require('discord.js');
const { getGuildData } = require('../utils/dataManager');

const tempChannels = new Map(); // memberId: channelId

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {
		const { member, guild } = newState;
		const data = getGuildData(guild.id);
		const { voiceSettings } = data;

		if (!voiceSettings.interfaceChannelId) return;

		// Join to create
		if (newState.channelId === voiceSettings.interfaceChannelId) {
			const category = guild.channels.cache.get(voiceSettings.categoryId);
			const channel = await guild.channels.create({
				name: `${member.displayName}'s Room`,
				type: ChannelType.GuildVoice,
				parent: category || null,
			});

			await member.voice.setChannel(channel);
			tempChannels.set(member.id, channel.id);
		}

		// Leave to delete
		if (oldState.channelId && !newState.channelId) {
            const channel = oldState.channel;
            if ([...tempChannels.values()].includes(channel.id)) {
                if (channel.members.size === 0) {
                    await channel.delete().catch(() => {});
                    // Clean up map
                    for (let [mId, cId] of tempChannels.entries()) {
                        if (cId === channel.id) tempChannels.delete(mId);
                    }
                }
            }
		}
	},
};

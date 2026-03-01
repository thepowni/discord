const { Events, EmbedBuilder } = require('discord.js');
const { getGuildData } = require('../utils/dataManager');

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {
		const data = getGuildData(member.guild.id);
		if (!data.greetChannel) return;

		const channel = member.guild.channels.cache.get(data.greetChannel);
		if (!channel) return;

		const message = data.greetMessage.replace('{member}', member.toString());
		const embed = new EmbedBuilder()
			.setTitle('Welcome!')
			.setDescription(message)
			.setColor('Green')
			.setThumbnail(member.user.displayAvatarURL())
			.setTimestamp();

		await channel.send({ embeds: [embed] });
	},
};

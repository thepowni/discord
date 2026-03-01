const { Events } = require('discord.js');
const { getGuildData } = require('../utils/dataManager');

const spamMap = new Map();

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot || !message.guild) return;

		const data = await getGuildData(message.guild.id);
		const { security } = data;

		// Anti-link
		if (security.antiLink) {
			const urlRegex = /https?:\/\/(?:[-\w.]|(?:%[\da-fA-F]{2}))+/;
			if (urlRegex.test(message.content)) {
				if (!message.member.permissions.has('ManageMessages')) {
					await message.delete().catch(() => {});
					return message.channel.send(`${message.author}, links are not allowed!`).then(m => setTimeout(() => m.delete(), 3000));
				}
			}
		}

		// Anti-spam
		if (security.antiSpam) {
			const authorId = message.author.id;
			const now = Date.now();
			const userData = spamMap.get(authorId) || { count: 0, lastMessage: now };

			if (now - userData.lastMessage < 2000) {
				userData.count++;
			} else {
				userData.count = 1;
			}
			userData.lastMessage = now;
			spamMap.set(authorId, userData);

			if (userData.count > 5) {
				if (!message.member.permissions.has('ManageMessages')) {
					await message.delete().catch(() => {});
					return message.channel.send(`${message.author}, stop spamming!`).then(m => setTimeout(() => m.delete(), 3000));
				}
			}
		}
	},
};

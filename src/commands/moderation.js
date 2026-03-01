const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('moderation')
		.setDescription('Moderation commands')
		.addSubcommand(subcommand =>
			subcommand
				.setName('kick')
				.setDescription('Kick a member')
				.addUserOption(option => option.setName('target').setDescription('The member to kick').setRequired(true))
				.addStringOption(option => option.setName('reason').setDescription('The reason for kicking')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('ban')
				.setDescription('Ban a member')
				.addUserOption(option => option.setName('target').setDescription('The member to ban').setRequired(true))
				.addStringOption(option => option.setName('reason').setDescription('The reason for banning')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('clear')
				.setDescription('Clear messages')
				.addIntegerOption(option => option.setName('amount').setDescription('Number of messages to clear').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('timeout')
				.setDescription('Timeout a member')
				.addUserOption(option => option.setName('target').setDescription('The member to timeout').setRequired(true))
				.addIntegerOption(option => option.setName('duration').setDescription('Duration in minutes').setRequired(true))
				.addStringOption(option => option.setName('reason').setDescription('The reason for timeout')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('nuke')
                .setDescription('Delete and recreate the current channel'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const target = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason') || 'No reason provided';
		const embed = new EmbedBuilder().setColor('Red').setTimestamp();

		if (subcommand === 'kick') {
			const member = await interaction.guild.members.fetch(target.id);
			await member.kick(reason);
			embed.setTitle('Member Kicked').setDescription(`Successfully kicked ${target.tag}`).addFields({ name: 'Reason', value: reason });
			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'ban') {
			await interaction.guild.members.ban(target, { reason });
			embed.setTitle('Member Banned').setDescription(`Successfully banned ${target.tag}`).addFields({ name: 'Reason', value: reason });
			return interaction.reply({ embeds: [embed] });
		}

		if (subcommand === 'clear') {
			const amount = interaction.options.getInteger('amount');
			await interaction.channel.bulkDelete(amount, true);
			embed.setColor('Green').setTitle('Messages Cleared').setDescription(`Successfully cleared ${amount} messages.`);
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}

		if (subcommand === 'timeout') {
			const duration = interaction.options.getInteger('duration');
			const member = await interaction.guild.members.fetch(target.id);
			await member.timeout(duration * 60 * 1000, reason);
			embed.setTitle('Member Timed Out').setDescription(`Successfully timed out ${target.tag} for ${duration} minutes.`).addFields({ name: 'Reason', value: reason });
			return interaction.reply({ embeds: [embed] });
		}

        if (subcommand === 'nuke') {
            const position = interaction.channel.position;
            const parent = interaction.channel.parent;

            // Acknowledge the interaction before deleting the channel
            await interaction.reply({ content: 'Nuking channel...', ephemeral: true });

            const newChannel = await interaction.channel.clone();
            await interaction.channel.delete();

            if (newChannel) {
                await newChannel.setPosition(position);
                if (parent) await newChannel.setParent(parent);

                const nEmbed = new EmbedBuilder()
                    .setTitle('Channel Nuked')
                    .setDescription('This channel has been successfully recreated.')
                    .setColor('Red')
                    .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZqZzF4ZzR6ZzF4ZzR6ZzF4ZzR6ZzF4ZzR6ZzF4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/HhTXt43pk1I1W/giphy.gif')
                    .setTimestamp();

                await newChannel.send({ embeds: [nEmbed] });
            }
        }
	},
};

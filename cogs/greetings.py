import discord
from discord.ext import commands
from discord import app_commands
from utils.data_manager import get_guild_data, update_guild_data

class Greetings(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_join(self, member):
        data = get_guild_data(member.guild.id)
        channel_id = data.get("greet_channel")
        if channel_id:
            channel = member.guild.get_channel(channel_id)
            if channel:
                message = data.get("greet_message", "Welcome {member.mention} to the server!")
                try:
                    await channel.send(message.format(member=member))
                    # Add emoji/sticker if needed as per user request
                    # For now just send message.
                except Exception as e:
                    print(f"Error sending welcome message: {e}")

    @app_commands.command(name="set_welcome_channel", description="Set the channel for welcome messages")
    @app_commands.checks.has_permissions(administrator=True)
    async def set_welcome_channel(self, interaction: discord.Interaction, channel: discord.TextChannel):
        update_guild_data(interaction.guild.id, "greet_channel", channel.id)
        await interaction.response.send_message(f"Welcome channel set to {channel.mention}", ephemeral=True)

    @app_commands.command(name="set_welcome_message", description="Set the welcome message template")
    @app_commands.checks.has_permissions(administrator=True)
    async def set_welcome_message(self, interaction: discord.Interaction, message: str):
        update_guild_data(interaction.guild.id, "greet_message", message)
        await interaction.response.send_message(f"Welcome message template updated!", ephemeral=True)

async def setup(bot):
    await bot.add_cog(Greetings(bot))

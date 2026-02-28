import discord
from discord.ext import commands
from discord import app_commands

class Roles(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name="create_role", description="Create a new role in the server")
    @app_commands.checks.has_permissions(manage_roles=True)
    async def create_role(self, interaction: discord.Interaction, name: str, color: str = "000000"):
        try:
            guild = interaction.guild
            # Convert hex string to discord.Color
            discord_color = discord.Color(int(color.lstrip('#'), 16))
            role = await guild.create_role(name=name, color=discord_color)
            await interaction.response.send_message(f"Role `{role.name}` has been created!", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"Error: {e}", ephemeral=True)

    @app_commands.command(name="give_role", description="Give a role to a member")
    @app_commands.checks.has_permissions(manage_roles=True)
    async def give_role(self, interaction: discord.Interaction, member: discord.Member, role: discord.Role):
        try:
            await member.add_roles(role)
            await interaction.response.send_message(f"Gave {role.name} to {member.mention}", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"Error: {e}", ephemeral=True)

async def setup(bot):
    await bot.add_cog(Roles(bot))

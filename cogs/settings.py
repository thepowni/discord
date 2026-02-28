import discord
from discord.ext import commands
from discord import app_commands
from utils.data_manager import update_guild_data, get_guild_data

class Settings(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="setprefix")
    @commands.has_permissions(administrator=True)
    async def setprefix(self, ctx, prefix: str):
        update_guild_data(ctx.guild.id, "prefix", prefix)
        await ctx.send(f"Prefix updated to: `{prefix}`")

    @app_commands.command(name="setprefix", description="Change the bot's command prefix")
    @app_commands.checks.has_permissions(administrator=True)
    async def slash_setprefix(self, interaction: discord.Interaction, prefix: str):
        update_guild_data(interaction.guild.id, "prefix", prefix)
        await interaction.response.send_message(f"Prefix updated to: `{prefix}`", ephemeral=True)

    @commands.group(name="security", invoke_without_command=True)
    @commands.has_permissions(administrator=True)
    async def security(self, ctx):
        embed = self._get_security_embed(ctx.guild.id)
        await ctx.send(embed=embed)

    @app_commands.command(name="security_status", description="View security settings status")
    @app_commands.checks.has_permissions(administrator=True)
    async def slash_security_status(self, interaction: discord.Interaction):
        embed = self._get_security_embed(interaction.guild.id)
        await interaction.response.send_message(embed=embed, ephemeral=True)

    def _get_security_embed(self, guild_id):
        data = get_guild_data(guild_id)
        sec = data.get("security", {})
        embed = discord.Embed(title="Security Settings", color=discord.Color.blue())
        embed.add_field(name="Anti-Spam", value="Enabled" if sec.get("anti_spam") else "Disabled")
        embed.add_field(name="Anti-Link", value="Enabled" if sec.get("anti_link") else "Disabled")
        return embed

    @security.command(name="antispam")
    @commands.has_permissions(administrator=True)
    async def antispam(self, ctx, status: str):
        enabled = status.lower() == "on"
        self._update_security(ctx.guild.id, "anti_spam", enabled)
        await ctx.send(f"Anti-spam has been {'enabled' if enabled else 'disabled'}.")

    @app_commands.command(name="toggle_antispam", description="Enable or disable anti-spam")
    @app_commands.checks.has_permissions(administrator=True)
    async def slash_antispam(self, interaction: discord.Interaction, enabled: bool):
        self._update_security(interaction.guild.id, "anti_spam", enabled)
        await interaction.response.send_message(f"Anti-spam has been {'enabled' if enabled else 'disabled'}.", ephemeral=True)

    @security.command(name="antilink")
    @commands.has_permissions(administrator=True)
    async def antilink(self, ctx, status: str):
        enabled = status.lower() == "on"
        self._update_security(ctx.guild.id, "anti_link", enabled)
        await ctx.send(f"Anti-link has been {'enabled' if enabled else 'disabled'}.")

    @app_commands.command(name="toggle_antilink", description="Enable or disable anti-link")
    @app_commands.checks.has_permissions(administrator=True)
    async def slash_antilink(self, interaction: discord.Interaction, enabled: bool):
        self._update_security(interaction.guild.id, "anti_link", enabled)
        await interaction.response.send_message(f"Anti-link has been {'enabled' if enabled else 'disabled'}.", ephemeral=True)

    def _update_security(self, guild_id, key, enabled):
        data = get_guild_data(guild_id)
        sec = data.get("security", {})
        sec[key] = enabled
        update_guild_data(guild_id, "security", sec)

async def setup(bot):
    await bot.add_cog(Settings(bot))

import discord
from discord.ext import commands
from utils.data_manager import update_guild_data, get_guild_data

class Settings(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="setprefix")
    @commands.has_permissions(administrator=True)
    async def setprefix(self, ctx, prefix: str):
        update_guild_data(ctx.guild.id, "prefix", prefix)
        await ctx.send(f"Prefix updated to: `{prefix}`")

    @commands.group(name="security", invoke_without_command=True)
    @commands.has_permissions(administrator=True)
    async def security(self, ctx):
        data = get_guild_data(ctx.guild.id)
        sec = data.get("security", {})
        embed = discord.Embed(title="Security Settings", color=discord.Color.blue())
        embed.add_field(name="Anti-Spam", value="Enabled" if sec.get("anti_spam") else "Disabled")
        embed.add_field(name="Anti-Link", value="Enabled" if sec.get("anti_link") else "Disabled")
        await ctx.send(embed=embed)

    @security.command(name="antispam")
    @commands.has_permissions(administrator=True)
    async def antispam(self, ctx, status: str):
        enabled = status.lower() == "on"
        data = get_guild_data(ctx.guild.id)
        sec = data.get("security", {})
        sec["anti_spam"] = enabled
        update_guild_data(ctx.guild.id, "security", sec)
        await ctx.send(f"Anti-spam has been {'enabled' if enabled else 'disabled'}.")

    @security.command(name="antilink")
    @commands.has_permissions(administrator=True)
    async def antilink(self, ctx, status: str):
        enabled = status.lower() == "on"
        data = get_guild_data(ctx.guild.id)
        sec = data.get("security", {})
        sec["anti_link"] = enabled
        update_guild_data(ctx.guild.id, "security", sec)
        await ctx.send(f"Anti-link has been {'enabled' if enabled else 'disabled'}.")

async def setup(bot):
    await bot.add_cog(Settings(bot))

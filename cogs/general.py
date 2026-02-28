import discord
from discord.ext import commands
from discord import app_commands

class General(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="ping")
    async def ping(self, ctx):
        await ctx.send(f"Pong! {round(self.bot.latency * 1000)}ms")

    @app_commands.command(name="ping", description="Check the bot's latency")
    async def slash_ping(self, interaction: discord.Interaction):
        await interaction.response.send_message(f"Pong! {round(self.bot.latency * 1000)}ms")

    @commands.command(name="serverinfo")
    async def serverinfo(self, ctx):
        guild = ctx.guild
        embed = self._get_serverinfo_embed(guild)
        await ctx.send(embed=embed)

    @app_commands.command(name="serverinfo", description="Get information about the server")
    async def slash_serverinfo(self, interaction: discord.Interaction):
        embed = self._get_serverinfo_embed(interaction.guild)
        await interaction.response.send_message(embed=embed)

    def _get_serverinfo_embed(self, guild):
        embed = discord.Embed(title=f"Server Info - {guild.name}", color=discord.Color.green())
        embed.set_thumbnail(url=guild.icon.url if guild.icon else None)
        embed.add_field(name="Owner", value=guild.owner.mention)
        embed.add_field(name="Members", value=guild.member_count)
        embed.add_field(name="Roles", value=len(guild.roles))
        embed.add_field(name="Created At", value=guild.created_at.strftime("%Y-%m-%d"))
        return embed

    @commands.command(name="userinfo")
    async def userinfo(self, ctx, member: discord.Member = None):
        member = member or ctx.author
        embed = self._get_userinfo_embed(ctx.guild, member)
        await ctx.send(embed=embed)

    @app_commands.command(name="userinfo", description="Get information about a user")
    async def slash_userinfo(self, interaction: discord.Interaction, member: discord.Member = None):
        member = member or interaction.user
        embed = self._get_userinfo_embed(interaction.guild, member)
        await interaction.response.send_message(embed=embed)

    def _get_userinfo_embed(self, guild, member):
        embed = discord.Embed(title=f"User Info - {member.name}", color=member.color)
        embed.set_thumbnail(url=member.display_avatar.url)
        embed.add_field(name="ID", value=member.id)
        embed.add_field(name="Joined Server", value=member.joined_at.strftime("%Y-%m-%d") if member.joined_at else "Unknown")
        embed.add_field(name="Joined Discord", value=member.created_at.strftime("%Y-%m-%d"))
        roles = [role.mention for role in member.roles if role != guild.default_role]
        embed.add_field(name=f"Roles ({len(roles)})", value=" ".join(roles) if roles else "No roles")
        return embed

async def setup(bot):
    await bot.add_cog(General(bot))

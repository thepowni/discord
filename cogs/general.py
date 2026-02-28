import discord
from discord.ext import commands

class General(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="ping")
    async def ping(self, ctx):
        await ctx.send(f"Pong! {round(self.bot.latency * 1000)}ms")

    @commands.command(name="serverinfo")
    async def serverinfo(self, ctx):
        guild = ctx.guild
        embed = discord.Embed(title=f"Server Info - {guild.name}", color=discord.Color.green())
        embed.set_thumbnail(url=guild.icon.url if guild.icon else None)
        embed.add_field(name="Owner", value=guild.owner.mention)
        embed.add_field(name="Members", value=guild.member_count)
        embed.add_field(name="Roles", value=len(guild.roles))
        embed.add_field(name="Created At", value=guild.created_at.strftime("%Y-%m-%d"))
        await ctx.send(embed=embed)

    @commands.command(name="userinfo")
    async def userinfo(self, ctx, member: discord.Member = None):
        member = member or ctx.author
        embed = discord.Embed(title=f"User Info - {member.name}", color=member.color)
        embed.set_thumbnail(url=member.display_avatar.url)
        embed.add_field(name="ID", value=member.id)
        embed.add_field(name="Joined Server", value=member.joined_at.strftime("%Y-%m-%d"))
        embed.add_field(name="Joined Discord", value=member.created_at.strftime("%Y-%m-%d"))
        roles = [role.mention for role in member.roles if role != ctx.guild.default_role]
        embed.add_field(name=f"Roles ({len(roles)})", value=" ".join(roles) if roles else "No roles")
        await ctx.send(embed=embed)

async def setup(bot):
    await bot.add_cog(General(bot))

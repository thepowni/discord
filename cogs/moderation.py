import discord
from discord.ext import commands
from discord import app_commands
import datetime

class Moderation(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="kick")
    @commands.has_permissions(kick_members=True)
    async def kick(self, ctx, member: discord.Member, *, reason=None):
        await member.kick(reason=reason)
        await ctx.send(f'Member {member.mention} has been kicked. Reason: {reason}')

    @commands.command(name="ban")
    @commands.has_permissions(ban_members=True)
    async def ban(self, ctx, member: discord.Member, *, reason=None):
        await member.ban(reason=reason)
        await ctx.send(f'Member {member.mention} has been banned. Reason: {reason}')

    @commands.command(name="unban")
    @commands.has_permissions(ban_members=True)
    async def unban(self, ctx, *, member_id: int):
        user = await self.bot.fetch_user(member_id)
        await ctx.guild.unban(user)
        await ctx.send(f'User {user.name} has been unbanned.')

    @commands.command(name="clear")
    @commands.has_permissions(manage_messages=True)
    async def clear(self, ctx, amount: int):
        await ctx.channel.purge(limit=amount + 1)
        await ctx.send(f'Cleared {amount} messages.', delete_after=5)

    @commands.command(name="timeout")
    @commands.has_permissions(moderate_members=True)
    async def timeout(self, ctx, member: discord.Member, minutes: int, *, reason=None):
        duration = datetime.timedelta(minutes=minutes)
        await member.timeout(duration, reason=reason)
        await ctx.send(f'Member {member.mention} has been timed out for {minutes} minutes. Reason: {reason}')

async def setup(bot):
    await bot.add_cog(Moderation(bot))

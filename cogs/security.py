import discord
from discord.ext import commands
import re
from utils.data_manager import get_guild_data

class Security(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.antispam_cooldown = commands.CooldownMapping.from_tuple(5, 10, commands.BucketType.member)
        self.url_regex = re.compile(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+')

    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.bot or not message.guild:
            return

        data = get_guild_data(message.guild.id)
        security = data.get("security", {})

        # Anti-link
        if security.get("anti_link"):
            if self.url_regex.search(message.content):
                if not message.author.guild_permissions.manage_messages:
                    await message.delete()
                    await message.channel.send(f"{message.author.mention}, links are not allowed here!", delete_after=3)
                    return

        # Anti-spam
        if security.get("anti_spam"):
            bucket = self.antispam_cooldown.get_bucket(message)
            retry_after = bucket.update_rate_limit()
            if retry_after:
                if not message.author.guild_permissions.manage_messages:
                    await message.delete()
                    await message.channel.send(f"{message.author.mention}, stop spamming!", delete_after=3)
                    # Optionally timeout the user
                    # await message.author.timeout(datetime.timedelta(minutes=5), reason="Spamming")

async def setup(bot):
    await bot.add_cog(Security(bot))

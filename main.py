import discord
from discord.ext import commands
import os
import asyncio
from utils.data_manager import get_guild_data

def get_prefix(bot, message):
    if not message.guild:
        return "!"
    data = get_guild_data(message.guild.id)
    return data.get("prefix", "!")

class MyBot(commands.Bot):
    def __init__(self):
        intents = discord.Intents.all()
        super().__init__(command_prefix=get_prefix, intents=intents)

    async def setup_hook(self):
        # Import VoicePanel here to avoid circular imports if any,
        # but since it's in cogs.voice it should be fine to import it or
        # just register it when the cog is loaded.
        # However, for persistence, we should register it here if we want it to work across restarts.
        from cogs.voice import VoicePanel
        self.add_view(VoicePanel())

        for filename in os.listdir('./cogs'):
            if filename.endswith('.py'):
                try:
                    await self.load_extension(f'cogs.{filename[:-3]}')
                    print(f'Loaded extension: {filename}')
                except Exception as e:
                    print(f'Failed to load extension {filename}: {e}')

        # Syncing commands
        try:
            synced = await self.tree.sync()
            print(f"Synced {len(synced)} command(s)")
        except Exception as e:
            print(f"Failed to sync commands: {e}")

    async def on_ready(self):
        print(f'Logged in as {self.user} (ID: {self.user.id})')
        print('------')

bot = MyBot()

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You don't have permission to use this command.")
    elif isinstance(error, commands.MemberNotFound):
        await ctx.send("Member not found.")
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(f"Missing required argument: {error.param}")
    else:
        print(f"Unhandled error: {error}")

async def main():
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        print("DISCORD_TOKEN environment variable not set. Please provide a token to start the bot.")
        # For the sake of this task being complete, we provide the structure.
        # The user will run it with their own token.
        return

    async with bot:
        await bot.start(token)

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(f"Fatal error: {e}")

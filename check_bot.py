import asyncio
import discord
from discord.ext import commands
from main import MyBot
import os

async def check():
    bot = MyBot()
    # We don't need a token to load cogs and check the tree
    await bot.setup_hook()

    print("--- Loaded Cogs ---")
    for cog_name in bot.cogs:
        print(f"Cog: {cog_name}")

    print("\n--- Command Tree ---")
    for command in bot.tree.get_commands():
        print(f"Slash Command: {command.name}")

if __name__ == "__main__":
    try:
        asyncio.run(check())
    except Exception as e:
        print(f"Verification failed: {e}")

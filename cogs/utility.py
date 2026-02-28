import discord
from discord.ext import commands
from discord import app_commands
import aiohttp
from io import BytesIO

class Utility(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name="add_emoji", description="Add an emoji to the server from a URL")
    @app_commands.checks.has_permissions(manage_expressions=True)
    async def add_emoji(self, interaction: discord.Interaction, name: str, url: str):
        await interaction.response.defer(ephemeral=True)
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status != 200:
                        return await interaction.followup.send("Failed to download image.", ephemeral=True)
                    image_data = await response.read()

            # Check size (Discord limit for emojis is 256KB)
            if len(image_data) > 256 * 1024:
                return await interaction.followup.send("Image size too large (max 256KB).", ephemeral=True)

            emoji = await interaction.guild.create_custom_emoji(name=name, image=image_data)
            await interaction.followup.send(f"Emoji {emoji} has been added!", ephemeral=True)
        except Exception as e:
            await interaction.followup.send(f"Error: {e}", ephemeral=True)

    @app_commands.command(name="add_sticker", description="Add a sticker to the server from a URL")
    @app_commands.checks.has_permissions(manage_expressions=True)
    async def add_sticker(self, interaction: discord.Interaction, name: str, description: str, url: str, emoji: str = "😀"):
        await interaction.response.defer(ephemeral=True)
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status != 200:
                        return await interaction.followup.send("Failed to download image.", ephemeral=True)
                    image_data = await response.read()

            # Stickers have strict limits (PNG/APNG, max 512KB, exactly 512x512)
            if len(image_data) > 512 * 1024:
                return await interaction.followup.send("Sticker size too large (max 512KB).", ephemeral=True)

            file = discord.File(BytesIO(image_data), filename="sticker.png")

            try:
                sticker = await interaction.guild.create_sticker(
                    name=name,
                    description=description,
                    emoji=emoji,
                    file=file,
                    reason=f"Added by {interaction.user}"
                )
                await interaction.followup.send(f"Sticker `{sticker.name}` has been added!", ephemeral=True)
            except discord.HTTPException as e:
                await interaction.followup.send(f"Failed to create sticker: {e}. Ensure the image is a valid PNG/APNG and exactly 512x512.", ephemeral=True)
        except Exception as e:
            await interaction.followup.send(f"Error: {e}", ephemeral=True)

async def setup(bot):
    await bot.add_cog(Utility(bot))

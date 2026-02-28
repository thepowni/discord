import discord
from discord.ext import commands
from discord import ui, app_commands
from utils.data_manager import get_guild_data, update_guild_data

class VoiceRenameModal(ui.Modal, title="Rename Your Voice Channel"):
    name = ui.TextInput(label="New Channel Name", placeholder="My Awesome Room", min_length=1, max_length=32)

    async def on_submit(self, interaction: discord.Interaction):
        if not interaction.user.voice:
            return await interaction.response.send_message("You are not in a voice channel!", ephemeral=True)

        await interaction.user.voice.channel.edit(name=self.name.value)
        await interaction.response.send_message(f"Channel renamed to `{self.name.value}`!", ephemeral=True)

class VoicePanel(ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @ui.button(label="Lock/Unlock", style=discord.ButtonStyle.secondary, custom_id="voice_lock")
    async def lock(self, interaction: discord.Interaction, button: ui.Button):
        if not interaction.user.voice:
            return await interaction.response.send_message("You are not in a voice channel!", ephemeral=True)

        channel = interaction.user.voice.channel
        overwrites = channel.overwrites_for(interaction.guild.default_role)
        overwrites.connect = not overwrites.connect
        await channel.set_permissions(interaction.guild.default_role, overwrite=overwrites)
        status = "locked" if not overwrites.connect else "unlocked"
        await interaction.response.send_message(f"Channel {status}!", ephemeral=True)

    @ui.button(label="Rename", style=discord.ButtonStyle.primary, custom_id="voice_rename")
    async def rename(self, interaction: discord.Interaction, button: ui.Button):
        if not interaction.user.voice:
            return await interaction.response.send_message("You are not in a voice channel!", ephemeral=True)
        await interaction.response.send_modal(VoiceRenameModal())

class Voice(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.temp_channels = {} # user_id: channel_id

    @commands.command(name="setup_voice")
    @commands.has_permissions(administrator=True)
    async def setup_voice(self, ctx):
        await self._perform_setup(ctx)

    @app_commands.command(name="setup_voice", description="Setup temporary voice channel system")
    @app_commands.checks.has_permissions(administrator=True)
    async def slash_setup_voice(self, interaction: discord.Interaction):
        await self._perform_setup(interaction)

    async def _perform_setup(self, target):
        guild = target.guild
        try:
            category = await guild.create_category("Temporary Voice")
            interface_channel = await guild.create_voice_channel("Join to Create", category=category)

            update_guild_data(guild.id, "voice_settings", {
                "category_id": category.id,
                "interface_channel_id": interface_channel.id
            })

            embed = discord.Embed(title="Voice Control Panel", description="Use the buttons below to manage your temporary voice channel.", color=discord.Color.blue())

            if isinstance(target, commands.Context):
                await target.send(embed=embed, view=VoicePanel())
                await target.send(f"Voice setup complete. Join {interface_channel.mention} to create a private channel.")
            else:
                await target.response.send_message(f"Voice setup complete. Join {interface_channel.mention} to create a private channel.", embed=embed, view=VoicePanel())
        except discord.Forbidden:
            msg = "I don't have permission to create channels/categories."
            if isinstance(target, commands.Context):
                await target.send(msg)
            else:
                await target.response.send_message(msg, ephemeral=True)

    @commands.Cog.listener()
    async def on_voice_state_update(self, member, before, after):
        data = get_guild_data(member.guild.id)
        voice_settings = data.get("voice_settings", {})
        interface_id = voice_settings.get("interface_channel_id")

        if after.channel and after.channel.id == interface_id:
            category_id = voice_settings.get("category_id")
            category = self.bot.get_channel(category_id) if category_id else None
            try:
                channel = await member.guild.create_voice_channel(name=f"{member.name}'s Room", category=category)
                await member.move_to(channel)
                self.temp_channels[member.id] = channel.id
            except discord.Forbidden:
                pass

        if before.channel and before.channel.id in self.temp_channels.values():
            if len(before.channel.members) == 0:
                try:
                    await before.channel.delete()
                    self.temp_channels = {k: v for k, v in self.temp_channels.items() if v != before.channel.id}
                except (discord.NotFound, discord.Forbidden):
                    pass

async def setup(bot):
    await bot.add_cog(Voice(bot))

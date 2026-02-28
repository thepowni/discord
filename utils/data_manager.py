import json
import os

DATA_FILE = 'data.json'

DEFAULT_DATA = {
    "guilds": {}
}

def load_data():
    if not os.path.exists(DATA_FILE):
        save_data(DEFAULT_DATA)
        return DEFAULT_DATA
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return DEFAULT_DATA

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

def get_guild_data(guild_id):
    data = load_data()
    guild_id = str(guild_id)
    if guild_id not in data["guilds"]:
        data["guilds"][guild_id] = {
            "prefix": "!",
            "security": {
                "anti_spam": False,
                "anti_link": False
            },
            "mod_logs": [],
            "voice_settings": {
                "category_id": None,
                "interface_channel_id": None
            },
            "greet_channel": None,
            "greet_message": "Welcome {member.mention} to the server!"
        }
        save_data(data)
    return data["guilds"][guild_id]

def update_guild_data(guild_id, key, value):
    data = load_data()
    guild_id = str(guild_id)
    if guild_id not in data["guilds"]:
        get_guild_data(guild_id)
        data = load_data()

    data["guilds"][guild_id][key] = value
    save_data(data)

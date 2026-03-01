const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data.json');

const defaultData = {
    guilds: {}
};

async function loadData() {
    try {
        const raw = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        if (e.code === 'ENOENT') {
            await saveData(defaultData);
            return defaultData;
        }
        return defaultData;
    }
}

async function saveData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 4));
}

async function getGuildData(guildId) {
    const data = await loadData();
    if (!data.guilds[guildId]) {
        data.guilds[guildId] = {
            security: {
                antiSpam: false,
                antiLink: false
            },
            greetChannel: null,
            greetMessage: "Welcome to the server, {member}!",
            voiceSettings: {
                categoryId: null,
                interfaceChannelId: null
            },
            tempChannels: {} // memberId: channelId
        };
        await saveData(data);
    }
    return data.guilds[guildId];
}

async function updateGuildData(guildId, key, value) {
    const data = await loadData();
    if (!data.guilds[guildId]) {
        await getGuildData(guildId);
        // Refresh data after creation
        const refreshedData = await loadData();
        refreshedData.guilds[guildId][key] = value;
        await saveData(refreshedData);
    } else {
        data.guilds[guildId][key] = value;
        await saveData(data);
    }
}

module.exports = {
    getGuildData,
    updateGuildData
};

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data.json');

const defaultData = {
    guilds: {}
};

function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        saveData(defaultData);
        return defaultData;
    }
    try {
        const raw = fs.readFileSync(DATA_FILE);
        return JSON.parse(raw);
    } catch (e) {
        return defaultData;
    }
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
}

function getGuildData(guildId) {
    const data = loadData();
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
            modLogsChannel: null
        };
        saveData(data);
    }
    return data.guilds[guildId];
}

function updateGuildData(guildId, key, value) {
    const data = loadData();
    if (!data.guilds[guildId]) {
        getGuildData(guildId);
    }
    data.guilds[guildId][key] = value;
    saveData(data);
}

module.exports = {
    getGuildData,
    updateGuildData
};

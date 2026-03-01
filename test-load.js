const fs = require('node:fs');
const path = require('node:path');

console.log("--- Starting module load test ---");

try {
    const commandsPath = path.join(__dirname, 'src/commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    console.log(`Checking ${commandFiles.length} command files...`);
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            console.log(`Successfully loaded command file: ${file} [${command.data.name}]`);
        } else {
            console.warn(`[WARNING] Command at ${file} is missing required "data" or "execute" property.`);
        }
    }

    const eventsPath = path.join(__dirname, 'src/events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    console.log(`Checking ${eventFiles.length} event files...`);
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if ('name' in event && 'execute' in event) {
            console.log(`Successfully loaded event file: ${file} [${event.name}]`);
        } else {
            console.warn(`[WARNING] Event at ${file} is missing required "name" or "execute" property.`);
        }
    }

    console.log("Checking dataManager...");
    const dataManager = require('./src/utils/dataManager');
    if (dataManager.getGuildData && dataManager.updateGuildData) {
        console.log("Successfully loaded dataManager.");
    }

    console.log("--- Module load test passed! ---");
} catch (error) {
    console.error("--- Module load test failed! ---");
    console.error(error);
    process.exit(1);
}

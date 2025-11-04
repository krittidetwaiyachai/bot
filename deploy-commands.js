const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { CLIENT_ID, DISCORD_TOKEN } = require('./config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('[System] กำลังลงทะเบียน Slash Commands...');

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log('[System] ลงทะเบียน Slash Commands สำเร็จ!');
  } catch (error) {
    console.error('[System] เกิดข้อผิดพลาด:', error);
  }
})();

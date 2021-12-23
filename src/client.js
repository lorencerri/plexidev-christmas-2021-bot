const { SapphireClient } = require('@sapphire/framework');
const { Constants } = require('discord.js');
const { env } = require('./config');
const colors = require('colorette');

const logClientIn = async () => {
    const client = new SapphireClient({
        enableLoaderTraceLoggings: true,
        partials: [Constants.PartialTypes.CHANNEL],
        disableMentions: 'everyone',
        intents: [
            'GUILDS',
            'GUILD_MEMBERS',
            'GUILD_BANS',
            'GUILD_EMOJIS_AND_STICKERS',
            'GUILD_MESSAGES',
            'GUILD_MESSAGE_REACTIONS',
            'GUILD_PRESENCES'
        ]
    });

    try {
        await client.login(env.DISCORD_BOT_TOKEN);
        client.logger.info(
            colors.bold(colors.green('Successfully logged in...'))
        );
    } catch (error) {
        client.logger.fatal(error);
        client.destroy();
        process.exit(1);
    }
};

module.exports = {
    logClientIn
};

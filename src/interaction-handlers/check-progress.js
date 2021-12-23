const {
    InteractionHandler,
    InteractionHandlerTypes
} = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const db = require('quick.db');

module.exports = class extends InteractionHandler {
    constructor(ctx) {
        super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
    }

    boolToEmoji(guild, bool) {
        return guild.emojis.cache.find(
            emoji => emoji.name === (bool ? 'toggleOn' : 'toggleOff')
        );
    }

    async run(interaction) {
        const { user, guild } = interaction;

        // Fetch Mission Progress
        const messages = db.get(`messages_${guild.id}.${user.id}`) || 0;
        const emojiNick = db.get(`emojiNick_${guild.id}.${user.id}`) || false;

        // Create Embed
        const embed = new MessageEmbed()
            .setColor(0x57f287)
            .setTitle(`Progress for ${user.tag}`)
            .addField(
                'Missions',
                `${this.boolToEmoji(
                    guild,
                    messages >= 10
                )} Send 10 messages in the server [Sent: ${messages}]\n${this.boolToEmoji(
                    guild,
                    emojiNick
                )} Add a Christmas themed emoji to your nickname`
            );

        // Send Embed
        interaction.reply({ embeds: [embed], ephemeral: true });
    }

    parse(interaction) {
        const { customId } = interaction;

        if (customId !== 'check-progress') return this.none();
        else return this.some(200);
    }
};

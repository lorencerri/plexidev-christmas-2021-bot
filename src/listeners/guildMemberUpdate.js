const { Listener } = require('@sapphire/framework');
const { Constants, MessageEmbed } = require('discord.js');
const db = require('quick.db');

class messageCreateEvent extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            event: Constants.Events.GUILD_MEMBER_UPDATE
        });
    }

    async run(oldMember, newMember) {
        const christmasEmojis = [
            '🎅',
            '🤶',
            '🧑‍🎄',
            '🧝',
            '🧝‍♂️',
            '🧝‍♀️',
            '👪',
            '🦌',
            '🍪',
            '🥛',
            '🍷',
            '🍴',
            '🌟',
            '❄️',
            '☃️',
            '⛄',
            '🔥',
            '🎁',
            '🧦',
            '🔔',
            '🎶',
            '🕯️'
        ];

        const { nickname, guild, user } = newMember;
        if (!nickname) return;

        if (christmasEmojis.some(emoji => nickname.includes(emoji))) {
            db.set(`emojiNick_${guild.id}.${user.id}`, true);

            // If they already sent 10 messages, add the christmas role
            if ((db.get(`messages_${guild.id}.${user.id}`) || 0) >= 10) {
                const christmasRole = guild.roles.cache.find(
                    r => r.name === 'Christmas 2021'
                );
                if (christmasRole) newMember.roles.add(christmasRole);
            }
        }
    }
}

module.exports = {
    messageCreateEvent
};

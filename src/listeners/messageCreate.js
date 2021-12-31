const { Listener } = require('@sapphire/framework');
const { Constants, MessageEmbed } = require('discord.js');
const db = require('quick.db');

class messageCreateEvent extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            event: Constants.Events.MESSAGE_CREATE
        });
    }

    getEmojiByName(emojis, name) {
        return emojis.cache.find(emoji => emoji.name === name);
    }

    async run(message) {
        const { member, author, guild } = message;

        // Return if bot
        if (author.bot) return;

        // Check last sent message timestamp
        const lastMessageTimestamp = db.get(`lmt_${guild.id}_${author.id}`);

        // Check if last message was sent in the last 5 seconds
        if (lastMessageTimestamp) {
            const timeSinceLastMessage = Date.now() - lastMessageTimestamp;
            // Increment messages if time since last message is greater than 5 seconds
            if (timeSinceLastMessage > 5000) {
                const messages = db.add(`messages_${guild.id}.${author.id}`, 1);

                // Check if user has sent more than 10 messages & has set emojiNick
                if (
                    messages[author.id] >= 10 &&
                    db.get(`emojiNick_${guild.id}.${author.id}`)
                ) {
                    // Add Christmas role
                    const christmasRole = guild.roles.cache.find(
                        r => r.name === 'Christmas 2021'
                    );
                    if (christmasRole) member.roles.add(christmasRole);
                }
            }
        } else db.add(`messages_${guild.id}.${author.id}`, 1);

        // Set last message timestamp
        db.set(`lmt_${guild.id}_${author.id}`, Date.now());

        // Check last leaderboard update timestamp
        const lastLeaderboardUpdateTimestamp = db.get(`lut_${guild.id}`);

        // Check if the leaderboard has been updated in the last minute
        const timeSinceLastLeaderboardUpdate =
            Date.now() - lastLeaderboardUpdateTimestamp;

        // Update the leaderboard if the time since the last update is greater than 60 seconds
        if (
            !lastLeaderboardUpdateTimestamp ||
            timeSinceLastLeaderboardUpdate > 60000
        ) {
            // Fetch leaderboard message
            const { channelID, messageID } =
                db.get(`deployed_messageID_${guild.id}`) || {};
            if (!channelID || !messageID) return;

            const channel = await message.guild.channels.fetch(channelID);
            if (!channel) return;

            const leaderboardMessage = await channel.messages.fetch(messageID);
            if (!leaderboardMessage) return;

            // Fetch members
            const members = db.get(`messages_${guild.id}`) || {};
            let leaderboard = [];

            for (const memberID in members) {
                const member = guild.members.cache.get(memberID);
                if (!member) continue;

                const messages = members[memberID];
                leaderboard.push([member.user.tag, messages]);
            }

            // Sort & compose leaderboard
            const total = leaderboard.reduce((cur, val) => cur + val[1], 0)
            leaderboard = [
                ...leaderboard,
                ...[...new Array(10)].map(() => ['...', 0])
            ];
            leaderboard = leaderboard.sort((a, b) => b[1] - a[1]);
            leaderboard = leaderboard.slice(0, 10);

            // Fetch Emojis
            const { emojis } = guild;
            const toggleOff = this.getEmojiByName(emojis, 'toggleOff');
            const tada = this.getEmojiByName(emojis, 'tada');
            const first = this.getEmojiByName(emojis, '1st');
            const second = this.getEmojiByName(emojis, '2nd');
            const third = this.getEmojiByName(emojis, '3rd');
            const ticket = this.getEmojiByName(emojis, 'ticket');

            let text = '';

            text += `${first} **\`${leaderboard[0][1]
                .toString()
                .padEnd(4)}\`** ${leaderboard[0][0]}\n`;

            text += `${second} **\`${leaderboard[1][1]
                .toString()
                .padEnd(4)}\`** ${leaderboard[1][0]}\n`;

            text += `${third} **\`${leaderboard[2][1]
                .toString()
                .padEnd(4)}\`** ${leaderboard[2][0]}\n`;

            for (let i = 3; i < leaderboard.length; i++) {
                text += `${ticket} **\`${leaderboard[i][1]
                    .toString()
                    .padEnd(4)}\`** ${leaderboard[i][0]}\n`;
            }

            // Create Embed
            const embed = new MessageEmbed()
                .setColor(0x57f287)
                .setTitle(`🎄 ${guild.name}'s Christmas Event! 🎄`)
                .addField(
                    'Missions',
                    `${toggleOff} Send 10 messages in the server\n${toggleOff} Add a Christmas themed emoji to your nickname`
                )
                .addField('Rewards', `${tada} Christmas 2021 Role`)
                .addField(
                    'Christmas Giveaway',
                    "Until January 1st, sending a message will grant you one ticket into a Discord Nitro giveaway! Spamming isn't counted, so don't spam!"
                )
                .addField('Leaderboard', text)
                .setFooter(`There are currently ${total} tickets in the raffle`);

            // Send Embed
            leaderboardMessage.edit({
                embeds: [embed]
            });
        }
    }
}

module.exports = {
    messageCreateEvent
};

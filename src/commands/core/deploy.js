const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Command, RegisterBehavior } = require('@sapphire/framework');
const db = require('quick.db');

class DeployCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'deploy',
            description:
                "Deploys the informational message for the current server's Christmas event",
            preconditions: ['OwnerOnly'],
            chatInputCommand: {
                register: true,
                behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
                guildIds: [process.env.GUILD_ID]
            }
        });
    }

    getEmojiByName(emojis, name) {
        return emojis.cache.find(emoji => emoji.name === name);
    }

    async chatInputRun(interaction) {
        const { guild } = interaction;
        const { emojis } = guild;

        // Fetch Emojis
        const toggleOff = this.getEmojiByName(emojis, 'toggleOff');
        const role = this.getEmojiByName(emojis, 'role');
        const tada = this.getEmojiByName(emojis, 'tada');
        const first = this.getEmojiByName(emojis, '1st');
        const second = this.getEmojiByName(emojis, '2nd');
        const third = this.getEmojiByName(emojis, '3rd');

        // Create Embed
        const embed = new MessageEmbed()
            .setColor(0x57f287)
            .setTitle(`🎄 ${interaction.guild.name}'s Christmas Event! 🎄`)
            .addField(
                'Missions',
                `${toggleOff} Send 10 messages in the server\n${toggleOff} Add a Christmas themed emoji to your nickname`
            )
            .addField('Rewards', `${tada} Christmas 2021 Role`)
            .addField(
                'Christmas Giveaway',
                "Until January 1st, sending a message will grant you one ticket into a giveaway! Spamming isn't counted, so don't spam!"
            )
            .addField(
                'Leaderboard',
                `${first} ...\n${second} ...\n${third} ...`
            );

        // Create Component
        const button = new MessageButton()
            .setCustomId('check-progress')
            .setLabel('Check Progress')
            .setStyle('PRIMARY');

        // Create Row
        const row = new MessageActionRow().addComponents([button]);

        // Send Embed
        const message = await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        // Send Interaction Response
        interaction.reply({ content: 'Deployed!', ephemeral: true });

        // Add MessageID to database
        db.set(`deployed_messageID_${guild.id}`, {
            channelID: message.channel.id,
            messageID: message.id
        });
    }
}

module.exports = {
    DeployCommand
};

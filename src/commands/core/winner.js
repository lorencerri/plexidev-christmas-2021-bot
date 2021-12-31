const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Command, RegisterBehavior } = require('@sapphire/framework');
const db = require('quick.db');

class WinnerCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'winner',
            description:
                "Rolls a winner for the current server's Christmas event",
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
        const tada = this.getEmojiByName(emojis, 'tada');
        const first = this.getEmojiByName(emojis, '1st');
        const second = this.getEmojiByName(emojis, '2nd');
        const third = this.getEmojiByName(emojis, '3rd');

        // Compile Array of Tickets
        const messages = db.get(`messages_${guild.id}`) || {};
        const tickets = Object.keys(messages).reduce(
            (acc, cur) =>
                acc.concat(...[...Array(messages[cur]).keys()].map(() => cur)),
            []
        );

        // Calculate Winner
        const winningIndex = Math.floor(Math.random() * tickets.length);
        const winner = tickets[winningIndex];

        // Create Embed
        const embed = new MessageEmbed()
            .setColor(0x57f287)
            .setTitle(
                `🎄 Results for ${interaction.guild.name}'s Christmas Event! 🎄`
            )
            .addField(
                'Missions',
                `This holiday, ${
                    guild.roles.cache.find(r => r.name === 'Christmas 2021')
                        .members.size
                } members have received the Christmas 2021 Role!`
            )
            .addField(
                'Christmas Giveaway',
                `${tada} There were ${tickets.length} tickets in the pool.\n${tada} The winning ticket of #${winningIndex}} was by <@${winner}>!`
            );

        // Create Component
        const button = new MessageButton()
            .setCustomId('check-progress')
            .setLabel('Check Progress')
            .setStyle('PRIMARY');

        // Create Row
        const row = new MessageActionRow().addComponents([button]);

        // Send Embed
        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        // Send Interaction Response
        interaction.reply({ content: 'Deployed!', ephemeral: true });
    }
}

module.exports = {
    WinnerCommand
};

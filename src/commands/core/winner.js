const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { Command, RegisterBehavior } = require('@sapphire/framework');
const PasteClient = require('pastebin-api').default;
const client = new PasteClient(process.env.PASTEBIN_KEY);
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
        const ticket = this.getEmojiByName(emojis, 'ticket');

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

        // Creating Pastebin of Tickets
        const url = await client.createPaste({
            code: JSON.stringify(tickets, null, 2),
            expireDate: 'N',
            format: 'javascript',
            name: 'tickets.json',
            publicity: 0
        });

        // Create Embed
        const embed = new MessageEmbed()
            .setColor(0x57f287)
            .setTitle(
                `🎄 Results for ${interaction.guild.name}'s Christmas Event! 🎄`
            )
            .addField(
                'Missions',
                `This holiday, **\`${
                    Object.keys(messages).length
                }\`** members partially completed the missions, while **\`${
                    guild.roles.cache.find(r => r.name === 'Christmas 2021')
                        .members.size
                }\`** fully completed them to obtain the **\`Christmas 2021\`** role!`
            )
            .addField(
                'Christmas Giveaway',
                `${ticket} There were ${
                    tickets.length
                } tickets in the pool.\n${tada} The winning ticket of #${winningIndex} was by <@${winner}> (${(
                    (100 * messages[winner]) /
                    tickets.length
                ).toFixed(
                    2
                )}%)!\n\n*You can view all of the tickets [here](${url})*`
            );

        // Send Embed
        await interaction.channel.send({
            embeds: [embed]
        });

        // Send Interaction Response
        interaction.reply({ content: 'Deployed!', ephemeral: true });
    }
}

module.exports = {
    WinnerCommand
};

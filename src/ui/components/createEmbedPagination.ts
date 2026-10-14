import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Message,
    MessageComponentInteraction,
} from 'discord.js'

interface CreateEmbedPaginationOptions<T> {
    message: Message
    items: T[]
    itemsPerPage?: number
    render: (
        items: T[],
        page: number,
        totalPages: number
    ) => EmbedBuilder
}

export async function createEmbedPagination<T>({
    message,
    items,
    itemsPerPage = 5,
    render,
}: CreateEmbedPaginationOptions<T>) {

    let page = 0

    const totalPages = Math.max(
        1,
        Math.ceil(items.length / itemsPerPage)
    )

    const getPageItems = () => {
        const start = page * itemsPerPage

        return items.slice(
            start,
            start + itemsPerPage
        )
    }

    const createButtons = () => {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('pagination_previous')
                    .setEmoji('◀️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),

                new ButtonBuilder()
                    .setCustomId('pagination_page')
                    .setLabel(`${page + 1} / ${totalPages}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),

                new ButtonBuilder()
                    .setCustomId('pagination_next')
                    .setEmoji('▶️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page >= totalPages - 1),
            )
    }

    const createView = () => ({
        embeds: [
            render(
                getPageItems(),
                page,
                totalPages
            ),
        ],
        components: [
            createButtons(),
        ],
    })

    const paginationMessage = await message.reply(
        createView()
    )

    const collector = paginationMessage.createMessageComponentCollector({
        filter: (interaction) =>
            interaction.user.id === message.author.id,
    })

    collector.on('collect', async (interaction: MessageComponentInteraction) => {

        if (interaction.customId === 'pagination_previous') {
            if (page > 0) {
                page--
            }
        }

        if (interaction.customId === 'pagination_next') {
            if (page < totalPages - 1) {
                page++
            }
        }

        await interaction.update(
            createView()
        )
    })

    return paginationMessage
}
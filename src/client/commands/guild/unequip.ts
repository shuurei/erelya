import { Command } from '@/structures/Command'
import { GuildMember, MessageFlags } from 'discord.js'

import { EmbedUI } from '@/ui/EmbedUI'
import { createActionRow, createButton } from '@/ui/components/common'
import { ShopItemService } from '@/database/services/shop-item.service'

export default new Command({
    nameLocalizations: {
        fr: 'déséquiper'
    },
    description: '🎨 Unequip a shop role',
    descriptionLocalizations: {
        fr: '🎨 Retirer un rôle de boutique'
    },
    async onInteraction(interaction) {
        const allItems = await ShopItemService.allItems(interaction.guild.id);
        const member = interaction.member as GuildMember

        const roles = allItems.filter((f) => member.roles.cache.has(f.roleId));

        if (!roles.length) {
            return await interaction.reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Vous n'avez aucun rôle de boutique d'équipé !`)
                ]
            });
        }

        const msg = await interaction.reply({
            embeds: [
                EmbedUI.createWarnMessage({
                    description: [
                        `Voulez-vous vraiment déséquipé votre rôle couleur ?`,
                        '-# 💡 Une fois le rôle supprimé vous ne serez pas **remboursé**'
                    ].join('\n')
                })
            ],
            components: [
                createActionRow([
                    createButton('Confirmer', { color: 'green', customId: '#confirm' }),
                    createButton('Annuler', { color: 'red', customId: '#cancel' })
                ])
            ],
            flags: MessageFlags.Ephemeral
        })

        try {
            const res = await msg.awaitMessageComponent({
                filter: (i) => i.user.id === interaction.user.id,
                time: 60_000
            });

            if (res.customId === '#confirm') {
                for (const item of roles) {
                    await member.roles.remove(item.roleId);
                }

                return await res.reply({
                    embeds: [
                        EmbedUI.createSuccessMessage(`Le rôle couleur vous a bien été déséquipé !`)
                    ]
                });
            }

            return await res.reply({
                embeds: [
                    EmbedUI.createWarnMessage(`Opération annnuler !`)
                ]
            });
        } catch {
            return await msg.edit({
                embeds: [
                    EmbedUI.createErrorMessage(`Une erreur est survenu`)
                ]
            })
        }
    }
})
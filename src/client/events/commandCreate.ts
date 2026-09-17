import { Event } from '@/structures'
import { BaseMessageOptions, ChatInputCommandInteraction, Message, Team } from 'discord.js'

import { UserService } from '@/database/services/user.service'

import { createNotifCard } from '@/ui/assets/cards/notifCard'
import { EmbedUI } from '@/ui' 

import { logger } from '@/utils'
import { GuildModuleName, GuildModuleService } from '@/database/services/guild-module.service'
import { UserDatabaseFlags } from '@/utils/user-flags'

const replyBy = async (interaction: Message | ChatInputCommandInteraction, payload: BaseMessageOptions) => {
    try {
        if (interaction instanceof ChatInputCommandInteraction) {
            return await interaction[interaction.deferred ? 'editReply' : 'reply'](payload);
        } else if (interaction instanceof Message && interaction.channel.isSendable()) {
            return await interaction.reply(payload);
        }
    } catch (ex: any) {
        logger.error(ex);
    }
}

export default new Event({
    name: 'commandCreate',
    async run({ events: [command, interaction, args] }) {
        const replyAuthorizationRefused = async (content: string[] | string) => {
            if (!Array.isArray(content)) {
                content = [content];
            }

            return await replyBy(interaction, {
                files: [
                    {
                        attachment: await createNotifCard({
                            text: `[${content}]`,
                            fontSize: 24,
                            theme: 'red'
                        }),
                        name: 'unauthorizedCard.png'
                    }
                ]
            });
        }

        const isSlash = interaction instanceof ChatInputCommandInteraction;
        const isMessage = interaction instanceof Message;

        try {
            const access = command.access ?? null;
            const guild = interaction.guild;
            const user = interaction instanceof Message
                ? interaction.author
                : interaction.user;

            const memberPermissions = interaction instanceof Message
                ? interaction.member?.permissions
                : interaction.memberPermissions;

            if (!(guild && user)) {
                throw new Error('No guild or no user')
            };

            const userDatabase = await UserService.findById(user.id);

            if (!this.client.application?.owner) {
                await this.client.application?.fetch();
            }

            const isDeveloper = (this.client.application!.owner as Team).members.has(user.id);

            if (access) {
                if (access.guild) {
                    if (access.guild.modules) {
                        const moduleNames = Object.keys(access.guild.modules) as GuildModuleName[];
                        const modules = await GuildModuleService.findMany(guild.id, moduleNames);

                        const allEnabled = moduleNames.every((name) => modules[name].isEnabled);
                        if (!allEnabled) {
                            return await replyAuthorizationRefused('Un ou plusieurs modules sont désactivés par le gérant du serveur.');
                        }

                        for (const moduleName of moduleNames) {
                            const moduleConfig = access.guild.modules[moduleName];
                            if (!moduleConfig) continue;

                            const fields = Object.keys(moduleConfig) as (keyof typeof moduleConfig)[];
                            if (fields.length < 1) continue;

                            const module = modules[moduleName];
                            const allFieldsEnabled = fields.every((field) => {
                                const required = moduleConfig[field];
                                const actual = module?.[field as keyof typeof module];

                                return !required || actual === true;
                            });

                            if (!allFieldsEnabled) {
                                return replyAuthorizationRefused('Une ou plusieurs options liées à un module requis sont désactivées.');
                            }
                        }
                    }
                }

                if (access.channel) {
                    if (
                        access.channel?.isNSFW && interaction.channel?.isTextBased()
                        && 'nsfw' in interaction.channel
                        && !interaction.channel.nsfw
                    ) {
                        return await replyAuthorizationRefused(`Contexte invalide. Salon NSFW requis.`);
                    }
                }

                if (access.user) {
                    if (access.user?.isDeveloper && !isDeveloper) {
                        return await replyAuthorizationRefused(`Autorisation insuffisante. Accès développeur requis.`);
                    }

                    if (userDatabase && !isDeveloper) {
                        if (access.user?.isBetaTester && !userDatabase.flagsBitField.has(UserDatabaseFlags.TESTER)) {
                            return await replyAuthorizationRefused(`Accès restreint. Statut tester requis.`);
                        }
                    }

                    if (access.user?.isGuildOwner && user.id !== guild.ownerId) {
                        return await replyAuthorizationRefused(`Vous n’êtes pas le propriétaire de cette serveur`);
                    }

                    if (access.user?.requiredPermissions && !memberPermissions?.has(access.user.requiredPermissions)) {
                        return await replyAuthorizationRefused(`Permissions insuffisantes.`);
                    }
                }
            }

            if (
                isSlash
                && command.onInteraction
                && interaction.inCachedGuild()
            ) {
                return await command.onInteraction(interaction);
            } else if (
                isMessage
                && command.onMessage
                && interaction.inGuild()
            ) {
                return await command.onMessage(interaction, { args });
            }
        } catch (err: any) {
            this.client.logger.error(err);

            if (this.client.hub && this.client.hub?.heartLogsChannel) {
                await this.client.hub.heartLogsChannel.send({
                    embeds: [
                        EmbedUI.create({
                            color: 'blue',
                            title: `🌐 Command Error`,
                            description: [
                                `- Command Type: \`${isSlash ? 'Slash' : isMessage ? 'Message' : 'Unknown'}\``,
                                `- Guild`,
                                `  - \`${interaction.guild?.name}\``,
                                `  - \`${interaction.guild?.id}\``,
                                `- Author`,
                                `  - \`${interaction.member?.user?.username}\``,
                                `  - \`${interaction.member?.user?.id}\``,
                            ].join(`\n`)
                        }),
                        EmbedUI.create({
                            color: 'red',
                            title: '🐞 Stack',
                            description: `>>> ${err?.stack}`
                        })
                    ],
                });
            }

            return await replyBy(interaction, {
                files: [
                    {
                        attachment: await createNotifCard({
                            text: '[Une anomalie a été détectée.]',
                            theme: 'red'
                        }),
                        name: 'errorCard.png'
                    }
                ]
            });
        }
    }
});
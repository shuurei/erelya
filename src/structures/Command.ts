import {
    APIApplicationCommandBasicOption,
    ChatInputCommandInteraction,
    InteractionContextType,
    LocalizationMap,
    Message,
    PermissionFlagsBits,
    PermissionResolvable,
    RESTPostAPIApplicationCommandsJSONBody
} from 'discord.js'

import { defaultGuildModuleSettings } from '@/database/utils'

import client from '@/client/instance'

// --- Message Command ---
export enum MessageCommandStyle {
    FLAT = 'flat',
    SLASH_COMMAND = 'slashCommand',
}

export interface MessageCommandOptions {
    name?: string;
    nameLocalizations?: LocalizationMap;
    style?: MessageCommandStyle | `${MessageCommandStyle}`;
    aliases?: string[];
}

// --- Slash Command ---
export interface SlashCommandContextOptions {
    guild?: boolean
    botDM?: boolean
    group?: boolean
}

export interface SlashCommandOptions {
    name?: string;
    nameLocalizations?: LocalizationMap;
    context?: SlashCommandContextOptions;
    arguments?: APIApplicationCommandBasicOption[];
}

// --- Command ---
export interface CommandAccessOptions {
    user?: {
        authorizedIds?: string[];
        isDeveloper?: boolean;
        isBetaTester?: boolean;
        isGuildOwner?: boolean;
        isStaff?: boolean;
        requiredPermissions?: (PermissionResolvable | bigint)[];
    },
    channel?: {
        authorizedIds?: string[];
        isNSFW?: boolean;
    },
    guild?: {
        authorizedIds?: string[];
        isPremium?: boolean;
        isPartner?: boolean;
        modules?: Partial<{
            [K in keyof typeof defaultGuildModuleSettings]: Partial<{
                [P in keyof typeof defaultGuildModuleSettings[K]]: boolean
            }> | boolean
        }>
    };
}

export interface CommandOnMessageContext {
    args: (string | null)[];
}

export interface CommandOptions {
    nameLocalizations?: LocalizationMap;
    description?: string;
    descriptionLocalizations?: LocalizationMap;
    access?: CommandAccessOptions;
    cooldown?: number;
    slashCommand?: SlashCommandOptions;
    messageCommand?: MessageCommandOptions;
    onInteraction?: (
        this: Command,
        interaction: ChatInputCommandInteraction<'cached'>,
    ) => any;
    onMessage?: (
        this: Command,
        message: Message<true>,
        ctx: CommandOnMessageContext
    ) => any;
}

export interface CommandStructure {
    interaction?: {
        commandName: string | null;
        subcommandName?: string | null;
        subcommandGroupName?: string | null;
    };
    message?: {
        commandName: string | null;
        parts?: string[];
    };
}

export class Command {
    nameLocalizations?: LocalizationMap;
    description?: string;
    descriptionLocalizations?: LocalizationMap;
    access?: CommandAccessOptions;

    messageCommand: MessageCommandOptions;
    slashCommand?: SlashCommandOptions;

    structure: CommandStructure;

    client: typeof client;

    onInteraction?: (interaction: ChatInputCommandInteraction) => any;

    onMessage?: (message: Message, ctx?: CommandOnMessageContext) => any;

    constructor(options: CommandOptions) {
        if (!(options.onInteraction || options.onMessage)) {
            throw new Error('A command must implement at least one handler: "onInteraction" for slash commands or "onMessage" for prefix commands !');
        }

        this.structure = {};

        Object.assign(this, options);

        this.messageCommand = {
            style: MessageCommandStyle.SLASH_COMMAND,
            ...options?.messageCommand,
        };

        this.client = client;
    }

    get name() {
        const { message, interaction } = this.structure;
        return interaction?.subcommandName ?? interaction?.commandName ?? this.messageCommand?.name ?? message?.commandName ?? 'unknown';
    }
    
    toAPI() {
        const data: RESTPostAPIApplicationCommandsJSONBody = {
            name: this.name,
            description: this.description ?? this.name,
            name_localizations: this.nameLocalizations,
            description_localizations: this.descriptionLocalizations,
            nsfw: this.access?.channel?.isNSFW ?? false,
            options: this.slashCommand?.arguments
        }

        if (this.slashCommand?.context) {
            const { botDM, group, guild } = this.slashCommand.context;

            let contexts = [];

            if (guild) {
                contexts.push(InteractionContextType.Guild);
            }

            if (botDM) {
                contexts.push(InteractionContextType.BotDM);
            }

            if (group) {
                contexts.push(InteractionContextType.PrivateChannel);
            }

            data.contexts = contexts;
        }

        if (this.access?.user?.requiredPermissions) {
            data.default_member_permissions = this.access.user.requiredPermissions.reduce((
                acc: bigint,
                perm: keyof typeof PermissionFlagsBits | bigint
            ) => {
                const bit = typeof perm === 'bigint'
                    ? perm
                    : BigInt(PermissionFlagsBits[perm]);

                return acc | bit;
            }, 0n).toString();
        }

        return data;
    }
}
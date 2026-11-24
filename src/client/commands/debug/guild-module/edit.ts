import { GuildModuleService, GuildModuleName } from '@/database/services/guild-module.service'
import { Command } from '@/structures/Command'
import { EmbedUI } from '@/ui/EmbedUI'
import { notificationError } from '@/ui/notification-error'

import * as GuildModules from '@/database/entities/guild-module'
import { GuildService } from '@/database/services/guild.service';

export default new Command({
    access: {
        user: { isDeveloper: true }
    },
    messageCommand: {
        style: 'slashCommand'
    },
    async onMessage(message, { args: [moduleName, fieldName, value] }) {
        if (moduleName) {
            moduleName = moduleName.toLowerCase();
        }

        if (!moduleName) {
            return message.reply(await notificationError('Indique le nom du module à modifier.'));
        }

        if (!(moduleName in GuildModuleService.repos)) {
            return message.reply(await notificationError('Module introuvable.'));
        }

        if (!fieldName) {
            return message.reply(await notificationError('Indique le nom du champ à modifier.'));
        }

        const defaultModule = (GuildModules as any)[`default${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module`];

        if (!(fieldName in defaultModule)) {
            return message.reply(await notificationError('Champ introuvable dans ce module.'));
        }

        if (!value) {
            return message.reply(await notificationError('Indique la nouvelle valeur du champ.'));
        }

        const fieldType = typeof defaultModule[fieldName];
        let fieldValue: any = value;

        if (fieldType === 'number') {
            fieldValue = parseInt(value);
        } else if (fieldType === 'boolean') {
            fieldValue = value === 'true';
        }

        await GuildService.findOrCreate(message.guild.id);
        await GuildModuleService.repos[moduleName as GuildModuleName].upsert({
            guildId: message.guild.id,
            [fieldName]: fieldValue,
        }, ['guildId']);

        return await message.reply({
            embeds: [
                EmbedUI.createSuccessMessage({
                    title: `🔍 Debug - Modification d'un champ module de serveur`,
                    description: `Eh hop, j'ai défini **\`${fieldName}\`** du module **\`${moduleName}\`** avec la valeur **\`${fieldValue}\`** !`
                })
            ]
        });
    }
});

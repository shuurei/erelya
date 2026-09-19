import { GuildModuleService, GuildModuleName } from '@/database/services/guild-module.service'
import { Command } from '@/structures/Command'
import { EmbedUI } from '@/ui/EmbedUI'

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
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Euh.. Je crois que tu as oublié de mettre le **nom du module** que tu veux modifier hehe..`)
                ]
            });
        }

        if (!(moduleName in GuildModuleService.repos)) {
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Mhh.. Je ne trouves pas de **module** avec ce nom, êtes t'es certain d'avoir utilisé le bon nom ? 🤔`)
                ]
            });
        }

        if (!fieldName) {
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Euh.. Je crois que tu as oublié de mettre le **nom du champ** que tu veux modifier hehe..`)
                ]
            });
        }

        const defaultModule = (GuildModules as any)[`default${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module`];

        console.log(defaultModule, moduleName)

        if (!(fieldName in defaultModule)) {
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Mhh.. Je ne trouves pas de **champ** avec ce nom, t'es certain d'avoir utilisé le bon nom ? 🤔`)
                ]
            });
        }

        if (!value) {
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Je veux bien modifier le champ.. mais si j'ai pas de valeur ça va être complicado 😂`)
                ]
            });
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

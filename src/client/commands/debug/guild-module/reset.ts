import { GuildModuleName, GuildModuleService } from '@/database/services/guild-module.service';
import { Command } from '@/structures/Command'
import { EmbedUI } from '@/ui/EmbedUI'
import { notificationError } from '@/ui/notification-error'

export default new Command({
    access: {
        user: {
            isDeveloper: true
        }
    },
    messageCommand: {
        style: 'slashCommand'
    },
    async onMessage(message, { args: [moduleName] }) {
        if (!moduleName) {
            return message.reply(await notificationError('Indique le nom du module à réinitialiser.'));
        }

        if (!(moduleName in GuildModuleService.repos)) {
            return message.reply(await notificationError('Module introuvable.'));
        }

        await GuildModuleService.resetModule(message.guild.id, moduleName as GuildModuleName);

        return await message.reply({
            embeds: [
                EmbedUI.createSuccessMessage({
                    title: `🔍 Debug - Reset d'un module de serveur`,
                    description: `Youpi ! J'ai fini de reset le module tout est bon :)`
                })
            ]
        });
    }
});

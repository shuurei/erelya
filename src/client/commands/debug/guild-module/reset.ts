import { GuildModuleName, GuildModuleService } from '@/database/services/guild-module.service';
import { Command } from '@/structures/Command'
import { EmbedUI } from '@/ui/EmbedUI'

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
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Euh.. Je crois que tu as oublié de mettre le nom du module que tu veux reset hehe..`)
                ]
            });
        }

        if (!(moduleName in GuildModuleService.repos)) {
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage(`Mhh.. Je ne trouves pas de module avec ce nom, t'es certain d'avoir utilisé le bon nom ? 🤔`)
                ]
            });
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

import { Event } from '@/structures'
import { MessageFlags } from 'discord.js'

import { EmbedUI } from '@/ui'

export default new Event({
    name: 'guildMemberAdd',
    async run({ events: [member] }) {
        const guild = member.guild;

        if (process.env.ENV === 'DEV') return;

        if (this.client.mainGuild.id === guild.id) {
            return await this.client.mainGuild.welcomeChannel.send({
                embeds: [
                    EmbedUI.createMessage({
                        color: 'indigo',
                        title: '˗ˏˋ ★ ˎˊ˗ Nouvelle invocation  ˗ˏˋ ★ ˎˊ˗',
                        description: [
                            `· · ─ ·✦· ─ · ·`,
                            `Bienvenue ${member} sur **Lunaria** !! ☆ ᶻ 𝗓 𐰁`,
                            `╰┈➤ J'espère que tu vas te plaire parmi nous ! :)`,
                            `Merci de lire le <#1282786070907584604> avant de discuter ! Merci ! ⋆｡°✩`,
                            `⁺⋆₊✧───────────✩₊⁺⋆☾⋆⁺₊✧───────────✩₊⁺⋆⁺`,
                        ].join('\n'),
                        thumbnail: {
                            url: member.user.avatarURL() ?? member.user.defaultAvatarURL,
                        },
                        image: {
                            url: 'https://i.pinimg.com/originals/cd/0a/c5/cd0ac53c65a93a2ccfabb720e1dcb0fe.gif'
                        },
                        timestamp: Date.now()
                    })
                ]
            }).then(async (msg) => await msg.react('🌠'))
        }
    }
});

export type ApplicationEmojiName = 'voiceChannel'
    | 'stageChannel'
    | 'textChannel'
    | 'categoryChannel'
    | 'redArrow'
    | 'greenArrow'
    | 'yellowArrow'
    | 'purpleArrow'
    | 'blueArrow'
    | 'cyanArrow'
    | 'whiteArrow'
    | 'pinkArrow'
    | 'online'
    | 'idle'
    | 'dnd'
    | 'lightGrayBullet'
    | 'yellowBullet'
    | 'redBullet'
    | 'blueBullet'
    | 'greenBullet'
    | 'whiteRect'
    | 'greenRect'
    | 'yellowRect'
    | 'redRect'
    | 'indogoRect'
    | 'unknownRank'
    | 'ERank'
    | 'DRank'
    | 'CRank'
    | 'BRank'
    | 'ARank'
    | 'SRank'
    | 'NRank'
    | 'XRank'
    | 'loading'

export type ArrowColorName = 'red'
    | 'green'
    | 'purple'
    | 'blue'
    | 'yellow'
    | 'cyan'
    | 'white'
    | 'pink';

export const applicationEmojiDev: Record<ApplicationEmojiName, string> = {
    voiceChannel: '1366513582199541800',
    stageChannel: '1366513562784366723',
    textChannel: '1366513550956167189',
    categoryChannel: '1366513539497463848',

    redArrow: '1366512771260481626',
    greenArrow: '1366512787991433236',
    yellowArrow: '1366512779556818954',
    purpleArrow: '1366512763303628810',
    blueArrow: '1373467069768536165',
    cyanArrow: '1373467006795387003',
    whiteArrow: '1373466902801809478',
    pinkArrow: '1373466950726062141',

    blueBullet: '1418433617238950038',
    greenBullet: '1412969556682739926',
    yellowBullet: '1412969569076904046',
    lightGrayBullet: '1412972142584135771',
    redBullet: '1412972111928103024',

    whiteRect: '1423334828551573588',
    yellowRect: '1423335622499766432',
    redRect: '1423335629172904220',
    greenRect: '1423334822482546801',
    indogoRect: '1423335752284115155',

    online: '1366512708853174343',
    idle: '1366512718399537232',
    dnd: '1366512728239509504',

    unknownRank: '1560931083732656178',
    ERank: '1560931080469479444',
    DRank: '1560931079026909234',
    CRank: '1560931077441191998',
    BRank: '1560931075856011284',
    ARank: '1560931073913790554',
    SRank: '1560931084961714266',
    NRank: '1560931082201993336',
    XRank: '1560931086274666507',

    loading: '1563895204732338249'
}

export const applicationEmojiProd: Record<ApplicationEmojiName, string> = {
    voiceChannel: '1342655444484886650',
    stageChannel: '1342655729055826041',
    textChannel: '1342655488348655626',
    categoryChannel: '1342655898392334377',

    redArrow: '1342980251784970361',
    greenArrow: '1343069739978850447',
    yellowArrow: '1342980278804545670',
    purpleArrow: '1342980220394672221',
    blueArrow: '1385819721605316730',
    cyanArrow: '1385819670896050317',
    whiteArrow: '1385819618735816824',
    pinkArrow: '1385819789209112618',

    blueBullet: '1423305990958223482',
    greenBullet: '1423306041751371916',
    yellowBullet: '1423306085636374530',
    lightGrayBullet: '1423306128816738365',
    redBullet: '1423306178280296458',

    whiteRect: '1423361609933525103',
    yellowRect: '1423361596138192977',
    redRect: '1423361587154260238',
    greenRect: '1423361602073264341',
    indogoRect: '1423361570502738071',
    online: '1342979602468962487',
    idle: '1342979785835544576',
    dnd: '1342979809713848412',

    unknownRank: '1560932642793201705',
    ERank: '1560932639832150017',
    DRank: '1560932637911285840',
    CRank: '1560932636351004713',
    BRank: '1560932634710773761',
    ARank: '1560932633356144731',
    SRank: '1560932644701737081',
    NRank: '1560932641543426139',
    XRank: '1560932646073139242',

    loading: '',
} as const

export const currentApplicationEmoji = process.env.ENV === 'DEV'
    ? applicationEmojiDev
    : applicationEmojiProd;

export default currentApplicationEmoji;
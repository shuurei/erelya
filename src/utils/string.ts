export const jsonToMarkdown = (json: any, language = 'json') => {
    return `\`\`\`${language}\n${JSON.stringify(json, null, 4)}\`\`\``
}

export const isOnlySpaces = (str: string) => {
    return str.trim().length === 0
};

export const formatTimeLeft = (
    expireTimestamp: number,
    options?: {
        now?: number;
        withSeconds?: boolean,
        withMarkdown?: boolean
    },
): string => {
    const {
        now = Date.now(),
        withSeconds = false,
        withMarkdown = true,
    } = options ?? {}

    const remaining = Math.max(0, expireTimestamp - now)

    const hours = Math.floor(remaining / 3_600_000)
    const minutes = Math.floor((remaining % 3_600_000) / 60_000)
    const seconds = Math.floor((remaining % 60_000) / 1_000)

    const wrap = (value: string) => withMarkdown ? `**${value}**` : value

    if (hours > 0) {
        return wrap(
            withSeconds
                ? `${hours}h ${minutes}min ${seconds}s`
                : `${hours}h ${minutes}min`
        );
    }

    if (minutes > 0) {
        return wrap(
            withSeconds
                ? `${minutes}min ${seconds}s`
                : `${minutes}min`
        );
    }

    return wrap(`${seconds}s`);
}

export const formatTimeLeftFromMinutes = (
    remainingMinutes: number,
    withSeconds = false
): string => {
    const remainingMs = Math.max(0, remainingMinutes * 60_000);

    const hours = Math.floor(remainingMs / 3_600_000);
    const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
    const seconds = Math.floor((remainingMs % 60_000) / 1_000);

    if (hours > 0) {
        return withSeconds
            ? `**${hours}h ${minutes}min ${seconds}'s**`
            : minutes > 0
                ? `**${hours}h ${minutes}min**`
                : `**${hours}h**`;
    }

    if (minutes > 0) {
        return withSeconds
            ? `**${minutes}min ${seconds}'s**`
            : `**${minutes}min**`;
    }

    return `**${seconds}'s**`;
}

export const isEmoji = (char: string) => {
    return /\p{Emoji_Presentation}/u.test(char)
}

export const formatMedalRank = (rank: number | string) => {
    if (rank == 1) {
        return '🥇';
    } else if (rank == 2) {
        return '🥈';
    } else if (rank ==3) {
        return '🥉';
    } else {
        return rank.toLocaleString('en');
    }
}
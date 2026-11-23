export const AURA_HOUR_MS = 3_600_000;

export const auraHour = (timestamp = Date.now()) => {
    const startedAt = Math.floor(timestamp / AURA_HOUR_MS) * AURA_HOUR_MS;

    return {
        startedAt,
        changesAt: startedAt + AURA_HOUR_MS
    };
}

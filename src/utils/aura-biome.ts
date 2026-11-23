export const potionWeekStart = (timestamp = Date.now()) => {
    const date = new Date(timestamp);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);

    return date;
}

export const potionMonth = (timestamp = Date.now()) => {
    const date = new Date(timestamp);
    
    return {
        startedAt: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
        resetsAt: Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)
    };
}

export const hexToRgb = (hex: string) => {
    let clean = hex.replace('#', '');

    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }

    const bigint = parseInt(clean, 16);

    return [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        bigint & 255
    ];
}
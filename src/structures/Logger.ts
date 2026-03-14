import pc from 'picocolors'

import { SymbolsUI } from '@/ui/SymbolsUI'
import { hexToRgb } from '@/utils/color'
import { Formatter } from 'picocolors/types'

type RGB = [number, number, number];
type ColorInputArgs = string | RGB;

type DefaultColors = Omit<typeof pc, 'createColors' | 'isColorSupported'>

type LoggerColors = DefaultColors & {
    orange: Formatter;
    orangeBright: Formatter;
    purple: Formatter;
    purpleBright: Formatter;
    custom: (color: ColorInputArgs, text: string) => string;
    gradient: (startColor: ColorInputArgs, endColor: ColorInputArgs, text: string) => string;
}

type TextFormatter = string | ((color: LoggerColors) => string);

type LoggerOptions = {
    prefix?: TextFormatter
}

interface LoggerSeparatorOptions {
    lineColor?: (string & {}) | RGB | Exclude<keyof LoggerColors, 'custom' | 'gradient'>;
    lineWeight?: number;
}

interface LoggerInfoOptions {
    arrowColor?: (string & {}) | RGB | Exclude<keyof LoggerColors, 'custom' | 'gradient'>;
}

interface LoggerItem {
    label?: string;
    value?: string;
}

export class Logger {
    public formatters: LoggerColors;
    public defaultMaxLineLength: number;

    private prefix?: string

    private getFormatter(formatter: Exclude<keyof LoggerColors, 'custom' | 'gradient'>): Formatter;
    private getFormatter(formatter: string | RGB): Formatter;
    private getFormatter(formatter: string): Formatter {
        if (
            formatter in this.formatters
            && !(formatter === 'custom' || formatter === 'gradient')
        ) {
            return this.formatters[formatter as Exclude<keyof LoggerColors, 'custom' | 'gradient'>];
        } else {
            return (text: string) => this.formatters.custom(formatter, text);
        }
    }

    private applyCustomColor(color: ColorInputArgs, text: string): string {
        const [r, g, b] = typeof color === 'string'
            ? hexToRgb(color)
            : color;

        return `\x1b[38;2;${r};${g};${b}m${text}\x1b[39m`;
    }

    private applyGradientColor(startColor: ColorInputArgs, endColor: ColorInputArgs, text: string) {
        const startColorRGB = typeof startColor === 'string' ? hexToRgb(startColor) : startColor;
        const endColorRGB = typeof endColor === 'string' ? hexToRgb(endColor) : endColor;

        let out = '';
        const length = text.length;

        for (let i = 0; i < length; i++) {
            const t = i / (length - 1);

            const r = Math.round(startColorRGB[0] + (endColorRGB[0] - startColorRGB[0]) * t);
            const g = Math.round(startColorRGB[1] + (endColorRGB[1] - startColorRGB[1]) * t);
            const b = Math.round(startColorRGB[2] + (endColorRGB[2] - startColorRGB[2]) * t);

            out += `\x1b[38;2;${r};${g};${b}m${text[i]}`;
        }

        return out + '\x1b[0m';
    }

    constructor(options?: LoggerOptions) {
        this.defaultMaxLineLength = 50;

        this.formatters = {
            ...pc,
            orange: (text: string) => this.applyCustomColor('#ffbb62', text),
            orangeBright: (text: string) => this.applyCustomColor('#ffc983', text),
            purple: (text: string) => this.applyCustomColor('#5053ff', text),
            purpleBright: (text: string) => this.applyCustomColor('#bc8fff', text),
            custom: (color: ColorInputArgs, text: string) => this.applyCustomColor(color, text),
            gradient: (startColor: ColorInputArgs, endColor: ColorInputArgs, text: string) => this.applyGradientColor(startColor, endColor, text)
        };
        
        this.prefix = this.resolveText(options?.prefix);
    }

    private display(messages: TextFormatter[], type?: string) {
        const parts = [
            this.prefix,
            type,
            ...messages.map((message) => this.resolveText(message))
        ].filter(Boolean);
        console.log(...parts);
    }

    private resolveText(text?: TextFormatter): string | undefined {
        if (!text) return undefined

        if (typeof text === 'function') {
            return text(this.formatters);
        }

        return text
    }

    use(options?: LoggerOptions): Logger {
        return new Logger({
            prefix: options?.prefix ?? this.prefix
        });
    }

    info(message: TextFormatter, options?: LoggerInfoOptions) {
        const resolvedMessage = this.resolveText(message);
        const arrowColor = this.getFormatter(options?.arrowColor ?? 'purpleBright');
        console.log(`${arrowColor(`➤ `)} ${resolvedMessage}`);
    }

    log(...message: TextFormatter[]) {
        this.display(message);
    }

    warn(...message: TextFormatter[]) {
        this.display(message, this.formatters.bold(this.formatters.yellow('[WARN]')));
    }

    error(...message: TextFormatter[]) {
        this.display(message, this.formatters.bold(this.formatters.red('[ERROR]')));
    }

    success(...message: TextFormatter[]) {
        this.display(message, this.formatters.bold(this.formatters.green('[SUCCESS]')));
    }

    list(items: LoggerItem[]) {
        const labels = items
            .map((i) => i.label)
            .filter((l): l is string => !!l);

        const maxLabelLength = Math.max(
            0,
            ...labels.map(l => l.length)
        );

        for (const item of items) {
            if (!item.label) {
                console.log();
                continue
            }

            this.log(({ purpleBright, orangeBright }) =>
                `${purpleBright('➤ ')} ${item.label!.padEnd(maxLabelLength + 4)} ${orangeBright(item.value ?? '')}`
            );
        }
    }

    separator(options?: LoggerSeparatorOptions) {
        const lineColor = this.getFormatter(options?.lineColor ?? 'purple');
        console.log(`${lineColor(`━`.repeat(options?.lineWeight ?? this.defaultMaxLineLength))}`);
    }

    header(title: TextFormatter, options?: LoggerSeparatorOptions) {
        const resolvedTitle = this.resolveText(title) ?? '';
        const lineColor = this.getFormatter(options?.lineColor ?? 'purple');

        const totalWidth = options?.lineWeight ?? this.defaultMaxLineLength;

        const textLength = resolvedTitle.replace(/\x1b\[[0-9;]*m/g, '').length;

        const remaining = totalWidth - textLength - 2;
        const left = Math.ceil(remaining / 2);
        const right = Math.floor(remaining / 2);

        const leftSep = lineColor('━'.repeat(Math.max(0, left)));
        const rightSep = lineColor('━'.repeat(Math.max(0, right)));

        console.log(`${leftSep} ${resolvedTitle} ${rightSep}`);
    }
}
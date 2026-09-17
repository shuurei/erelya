import { BitField } from 'discord.js'

export const UserDatabaseFlags = {
    BANNED: 1 << 0,
    TESTER: 1 << 1,
    PARTNER: 1 << 2,
} as const;

export type UserDatabaseFlagsString = keyof typeof UserDatabaseFlags;

export class UserDatabaseFlagsBitField extends BitField<UserDatabaseFlagsString> {
    static Flags = UserDatabaseFlags;
}
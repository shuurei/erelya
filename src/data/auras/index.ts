import { normalAuras } from './normal'
import { windyAuras } from './windy'
import { snowyAuras } from './snowy'
import { rainyAuras } from './rainy'
import { sandstormAuras } from './sandstorm'
import { hellAuras } from './hell'
import { starfallAuras } from './starfall'
import { heavenAuras } from './heaven'
import { lostForestAuras } from './lost-forest'
import { corruptionAuras } from './corruption'
import { nullAuras } from './null'
import { glitchedAuras } from './glitched'
import { dreamspaceAuras } from './dreamspace'
import { cyberspaceAuras } from './cyberspace'
import { singularityAuras } from './singularity'
import { theRadiantForestAuras } from './the-radiant-forest'
import { SpecialAuras } from './special'
import type { Aura, RollableAura } from './types'

export type { Aura, RollableAura, SpecialAura } from './types'

const definitions = {
    ...normalAuras,
    ...windyAuras,
    ...snowyAuras,
    ...rainyAuras,
    ...sandstormAuras,
    ...hellAuras,
    ...starfallAuras,
    ...heavenAuras,
    ...lostForestAuras,
    ...corruptionAuras,
    ...nullAuras,
    ...glitchedAuras,
    ...dreamspaceAuras,
    ...cyberspaceAuras,
    ...singularityAuras,
    ...theRadiantForestAuras
} as const satisfies Record<string, RollableAura>

export const AuraDefinitions = { ...definitions, ...SpecialAuras } as const
export type AuraKey = keyof typeof AuraDefinitions
export type AuraEntry = Aura & { readonly key: AuraKey }

type AuraNames = { readonly [Key in AuraKey]: (typeof AuraDefinitions)[Key]['name'] }

export const Auras = Object.fromEntries(
    Object.entries(AuraDefinitions).map(([key, aura]) => [key, aura.name])
) as AuraNames

export const AURAS: readonly AuraEntry[] = (Object.keys(AuraDefinitions) as AuraKey[]).map((key) => ({ ...AuraDefinitions[key], key }));

export const ROLLABLE_AURAS = AURAS.filter((aura) => aura.chance !== null);
export const SPECIAL_AURAS = AURAS.filter((aura) => aura.chance === null);

export const AURAS_BY_KEY: ReadonlyMap<string, AuraEntry> = new Map(AURAS.map(aura => [aura.key, aura]));
export const AURAS_BY_NAME: ReadonlyMap<string, AuraEntry> = new Map(AURAS.map(aura => [aura.name, aura]));

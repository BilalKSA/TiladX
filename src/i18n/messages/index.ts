import { ar } from './ar'
import { en } from './en'
import type { Locale } from '..'

/** The message shape — Arabic is the source of truth (see ar.ts). */
export type Messages = typeof ar

export const messages: Record<Locale, Messages> = { ar, en }

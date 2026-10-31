// One typewriter for the whole site: the watermark, section labels, swapped titles and cursor tags
// all delete and type at the same cadence, behind the same caret.
export const TYPE_MS = 40;
export const DELETE_MS = 25;
export const CARET_HOLD_MS = 700; // caret lingers after the last key, then goes

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const TAG = 'MorrisEngineError';

export type MorrisEngineError = {
  readonly _tag: typeof TAG;
  readonly message: string;
  readonly cause: unknown;
};

export function toMorrisEngineError(x: unknown): MorrisEngineError {
  return {
    _tag: TAG,
    message: typeof x === 'object' && x && 'message' in x ? (x as any).message : String(x),
    cause: x,
  };
}

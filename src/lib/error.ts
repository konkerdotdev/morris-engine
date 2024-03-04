import { toTinyError } from '@konker.dev/tiny-error-fp';

export const ERROR_TAG = 'MorrisEngineError';
export type ERROR_TAG = typeof ERROR_TAG;

export const toMorrisEngineError = toTinyError<ERROR_TAG>(ERROR_TAG);
export type MorrisEngineError = ReturnType<typeof toMorrisEngineError>;

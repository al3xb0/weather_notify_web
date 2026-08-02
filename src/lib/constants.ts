/**
 * Mirrors of limits enforced by core-api. These are duplicated by hand until the
 * backend exposes them through a `GET /meta` endpoint — keep both sides in sync.
 *
 * @see apps/core-api/src/triggers/triggers.service.ts
 */
export const MAX_TRIGGERS_PER_USER = 10;
export const TEST_COOLDOWN_SEC = 600;

import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-please-change-me-now',
  dbPath: process.env.DB_PATH || './data/dd.sqlite',
  seasonDays: Number(process.env.SEASON_DURATION_DAYS || 90),
  ratingStart: Number(process.env.RATING_START || 1000),
  ratingK: 32,
  maxGdpDeltaTolerance: 100,
  maxRaidStealPercent: Number(process.env.MAX_RAID_STEAL_PERCENT || 0.15),
  shieldAfterRaidMs: Number(process.env.SHIELD_AFTER_RAID_MS || 7200000),
  matchRatingWindow: 150,
  matchRatingWindowMax: 500,
  matchWaitStepMs: 10000,
  matchResolveDelayMs: 20000,
  matchmakingTickMs: 2000,
  presenceBroadcastMs: 15000,
  seasonCheckMs: 3600000,
  antiCheatFlagLimit: 3,
  pvpBlockHours: 24
};

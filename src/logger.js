const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function ts() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export const logger = {
  info: (...a) => console.log(`${COLORS.cyan}[INFO ${ts()}]${COLORS.reset}`, ...a),
  warn: (...a) => console.warn(`${COLORS.yellow}[WARN ${ts()}]${COLORS.reset}`, ...a),
  error: (...a) => console.error(`${COLORS.red}[ERR ${ts()}]${COLORS.reset}`, ...a),
  game: (...a) => console.log(`${COLORS.magenta}[GAME ${ts()}]${COLORS.reset}`, ...a),
  net: (...a) => console.log(`${COLORS.blue}[NET ${ts()}]${COLORS.reset}`, ...a),
  ok: (...a) => console.log(`${COLORS.green}[OK ${ts()}]${COLORS.reset}`, ...a)
};

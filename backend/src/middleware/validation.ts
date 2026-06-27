import { Request, Response, NextFunction } from 'express';

// ─── Allowed enum values ──────────────────────────────────────────────────────
const ALLOWED_LEVELS = new Set(['basic', 'medium', 'strong']);
const ALLOWED_MODES = new Set(['all', 'ranges']);
const ALLOWED_DEGREES = new Set([0, 90, 180, 270, -90, -180, -270]);
const MAX_RANGES = 50;
const MAX_ROTATIONS = 1000;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function badRequest(res: Response, message: string) {
  return res.status(400).json({ success: false, error: message });
}

function isPositiveInteger(val: unknown): val is number {
  return typeof val === 'number' && Number.isInteger(val) && val > 0;
}

// ─── Compress route validator ─────────────────────────────────────────────────
export function validateCompress(req: Request, res: Response, next: NextFunction) {
  const { level } = req.body;

  if (level !== undefined && !ALLOWED_LEVELS.has(level)) {
    return badRequest(res, `Invalid compression level. Allowed: ${[...ALLOWED_LEVELS].join(', ')}.`);
  }

  // Sanitize: force to a known-good string (default: 'medium')
  req.body.level = ALLOWED_LEVELS.has(level) ? level : 'medium';
  return next();
}

// ─── Split route validator ────────────────────────────────────────────────────
export function validateSplit(req: Request, res: Response, next: NextFunction) {
  const { mode, ranges } = req.body;

  if (mode !== undefined && !ALLOWED_MODES.has(mode)) {
    return badRequest(res, `Invalid split mode. Allowed: ${[...ALLOWED_MODES].join(', ')}.`);
  }

  req.body.mode = ALLOWED_MODES.has(mode) ? mode : 'all';

  if (req.body.mode === 'ranges') {
    if (!ranges) {
      return badRequest(res, 'ranges is required when mode is "ranges".');
    }

    let parsed: unknown;
    try {
      parsed = typeof ranges === 'string' ? JSON.parse(ranges) : ranges;
    } catch {
      return badRequest(res, 'ranges must be valid JSON.');
    }

    if (!Array.isArray(parsed)) {
      return badRequest(res, 'ranges must be an array.');
    }

    if (parsed.length === 0 || parsed.length > MAX_RANGES) {
      return badRequest(res, `ranges must contain 1–${MAX_RANGES} entries.`);
    }

    for (const item of parsed) {
      if (
        typeof item !== 'object' ||
        item === null ||
        !isPositiveInteger(item.start) ||
        !isPositiveInteger(item.end)
      ) {
        return badRequest(res, 'Each range must have integer "start" and "end" values ≥ 1.');
      }
      if (item.start > item.end) {
        return badRequest(res, `Range start (${item.start}) cannot exceed end (${item.end}).`);
      }
    }

    req.body.ranges = JSON.stringify(parsed); // re-serialize validated data
  }

  return next();
}

// ─── Rotate route validator ───────────────────────────────────────────────────
export function validateRotate(req: Request, res: Response, next: NextFunction) {
  const { rotations, degrees } = req.body;

  if (degrees !== undefined) {
    const deg = Number(degrees);
    if (!ALLOWED_DEGREES.has(deg)) {
      return badRequest(res, `Invalid degrees value. Allowed: ${[...ALLOWED_DEGREES].join(', ')}.`);
    }
    req.body.degrees = deg;
    return next();
  }

  if (rotations !== undefined) {
    let parsed: unknown;
    try {
      parsed = typeof rotations === 'string' ? JSON.parse(rotations) : rotations;
    } catch {
      return badRequest(res, 'rotations must be valid JSON.');
    }

    if (!Array.isArray(parsed)) {
      return badRequest(res, 'rotations must be an array.');
    }

    if (parsed.length === 0 || parsed.length > MAX_ROTATIONS) {
      return badRequest(res, `rotations must contain 1–${MAX_ROTATIONS} entries.`);
    }

    for (const item of parsed) {
      if (
        typeof item !== 'object' ||
        item === null ||
        !Number.isInteger(item.pageIndex) ||
        item.pageIndex < 0 ||
        !ALLOWED_DEGREES.has(Number(item.degrees))
      ) {
        return badRequest(
          res,
          `Each rotation must have a non-negative integer "pageIndex" and a "degrees" value in [${[...ALLOWED_DEGREES].join(', ')}].`
        );
      }
    }

    req.body.rotations = JSON.stringify(parsed);
    return next();
  }

  return badRequest(res, 'Either "rotations" (array) or "degrees" (number) is required.');
}

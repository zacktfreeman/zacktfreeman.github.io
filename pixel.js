// ---------- Sprites ('.' = transparent, other chars map to COLORS) ----------
const COLORS = {
    k: '#1e1420', // shared outline
    // tent
    o: '#e8803a', d: '#b0532a', h: '#ffb066', n: '#2a1622',
    // campfire / lantern
    r: '#d9452b', f: '#ff9a3c', y: '#ffd25a', b: '#6b4226',
    // cabin
    R: '#8e3a32', S: '#5e2424', B: '#8b5a34', L: '#6e4528',
    Y: '#ffd86b', W: '#c98f3a', K: '#3a2416', c: '#8a8a96', C: '#5a5a68',
    // telescope
    g: '#8a8aa0', w: '#d8d8e0', t: '#2a2a3a', l: '#9fd3ff', e: '#4a4a5e',
    // fly fisher
    H: '#c9a66b', J: '#8a6a3a', P: '#e0a77a', V: '#6b6b3a', U: '#a3443a', Q: '#4a5a3a',
};

const FISHER = [
    '....kkk....',
    '...kHHHk...',
    '..kHHHHHk..',
    '.kJJJJJJJk.',
    '..kkkPPkk..',
    '..kPPPPk...',
    '.kkVVUVVk..',
    'kPUVVUVVk..',
    '.kkVVVVVk..',
    '..kQQQQQk..',
    '..kQQQQQk..',
    '..kQQQQQk..',
];

const TENT = [
    '.........k.........',
    '........khk........',
    '.......kohdk.......',
    '......koohddk......',
    '.....kooohdddk.....',
    '....koooonddddk....',
    '...koooohndddddk...',
    '..koooohnnndddddk..',
    '.kooooohnynddddddk.',
    'kooooohnnnnnddddddk',
];

const FIRE_FRAMES = [
    ['...r...', '..rf...', '..fyfr.', '.rfyyf.', '.fyyyfr', 'kbkbbkb', '.k...k.'],
    ['..r....', '...fr..', '.rfyf..', '.fyyfr.', 'rfyyyf.', 'kbbkbkb', '.k...k.'],
];

const CABIN = [
    '..........kk..kCCCk...',
    '.........kRSk.kccck...',
    '........kRRSSkkccck...',
    '.......kRRRSSSkccck...',
    '......kRRRRSSSSccck...',
    '.....kRRRRRSSSSSkk....',
    '....kRRRRRRSSSSSSk....',
    '...kRRRRRRRSSSSSSSk...',
    '..kRRRRRRRRSSSSSSSSk..',
    '.kSSSSSSSSSSSSSSSSSSk.',
    '..kkBBBBBBBBBBBBBBkk..',
    '...kLLYYYYLLKKKLLLk...',
    '...kBBWWWWBBKKKBBBk...',
    '...kLLYYYYLLKKKLLLk...',
    '...kBBYYYYBBKyKBBBk...',
    '...kLLLLLLLLKKKLLLk...',
    '...kBBBBBBBBKKKBBBk...',
];

const TELESCOPE = [
    '..............k..',
    '.............klk.',
    '...........kkwlk.',
    '..........kwwglk.',
    '........kkwggglk.',
    '......kkwwgggklk.',
    '.....kwwgggkk.k..',
    '...kkwggggk......',
    '..kwwgggtk.......',
    '.kwgggkkt........',
    '.kgggk..t........',
    '.kekk..ttt.......',
    '..k...t.t.t......',
    '.....t..t..t.....',
    '....t...t...t....',
    '...t....t....t...',
];

// Sky goes from night (top) to sunset (horizon)
const SKY = ['#0b0f2e', '#141541', '#1f1b52', '#3a2a63', '#6b3a6e', '#b5536b', '#e9824f', '#f6b26b'];
const SKY_NIGHT = ['#04061a', '#070a22', '#0a0e2b', '#0e1434', '#121a3e', '#182148', '#1e2852', '#25305c'];
// Length of the sunset <-> night transition (started by clicking the sun or moon)
const FADE_MS = 8000;
// Sprite colors that stay lit at night (windows, lantern)
const GLOW = 'YyW';
// Meadow goes from far (dusky) to near (brighter)
const MEADOW = ['#22392c', '#2a4a33', '#33593a', '#3d6b3a', '#4b7e40'];
// River reflects the dusk near the horizon, deep blue up close
const WATER = ['#7a5f8e', '#4d5f9e', '#3a5f9a', '#2f5590', '#264a80'];
const GRAVEL = ['#4f4b46', '#5e5a53', '#6e6a62', '#7f7a70'];
const PINE = { light: '#3f7a4a', dark: '#2a5236', edge: '#17281d', trunk: '#4a3020' };
const FLOWERS = ['#e05a5a', '#ffd25a', '#b07ad9', '#f0f0f0'];
const ROCK = { base: '#6f6c78', light: '#a3a0ad', dark: '#45434d' };
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

// ---------- Helpers ----------
function mulberry32(seed) {
    return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function drawDisc(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    for (let dy = -r; dy <= r; dy++) {
        const w = Math.floor(Math.sqrt(r * r - dy * dy + r * 0.5));
        ctx.fillRect(cx - w, cy + dy, 2 * w + 1, 1);
    }
}

function drawRock(ctx, x, y, s) {
    ctx.fillStyle = ROCK.base;
    ctx.fillRect(x, y, s, s);
    if (s === 1) return;
    ctx.fillStyle = ROCK.light;
    ctx.fillRect(x, y, s - 1, 1);
    ctx.fillStyle = ROCK.dark;
    ctx.fillRect(x, y + s - 1, s, 1);
    ctx.fillRect(x + s - 1, y, 1, s);
}

// Tiered pine: lit left side, shaded right side, shadow under each tier; base is the ground row
function drawPine(ctx, cx, base, h) {
    const trunkH = Math.max(1, Math.round(h * 0.15));
    const canopy = h - trunkH;
    const tierLen = Math.ceil(canopy / (h < 9 ? 2 : 3));
    ctx.fillStyle = PINE.trunk;
    ctx.fillRect(cx, base - trunkH, 1, trunkH);
    for (let r = 0; r < canopy; r++) {
        const tier = Math.floor(r / tierLen);
        const k = r - tier * tierLen;
        const half = tier + Math.round(k * 0.75);
        const underside = k === tierLen - 1 || r === canopy - 1;
        const y = base - h + r;
        ctx.fillStyle = underside ? PINE.dark : PINE.light;
        ctx.fillRect(cx - half, y, half + 1, 1);
        ctx.fillStyle = underside ? PINE.edge : PINE.dark;
        ctx.fillRect(cx + 1, y, half, 1);
        if (half > 0) {
            ctx.fillStyle = underside ? PINE.edge : PINE.dark;
            ctx.fillRect(cx - half, y, 1, 1);
        }
    }
}

// Pixel-stepped quadratic curve (used for the fishing line and rod)
function drawCurve(ctx, x0, y0, cx, cy, x1, y1, color) {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5) + 1;
    ctx.fillStyle = color;
    for (let i = 0; i <= n; i++) {
        const t = i / n, u = 1 - t;
        ctx.fillRect(Math.round(u * u * x0 + 2 * u * t * cx + t * t * x1),
            Math.round(u * u * y0 + 2 * u * t * cy + t * t * y1), 1, 1);
    }
}

function drawSprite(ctx, rows, x, y) {
    rows.forEach((row, j) => {
        [...row].forEach((c, i) => {
            if (c === '.') return;
            ctx.fillStyle = COLORS[c];
            ctx.fillRect(x + i, y + j, 1, 1);
        });
    });
}

// Pick a color from a gradient list at position t (0..1), dithered with a Bayer matrix
function ditherPick(colors, t, x, y) {
    const v = Math.max(0, Math.min(t, 1)) * (colors.length - 1);
    const idx = Math.floor(v);
    const up = v - idx > (BAYER[y % 4][x % 4] + 0.5) / 16;
    return colors[Math.min(idx + (up ? 1 : 0), colors.length - 1)];
}

// ---------- Scene ----------
const canvas = document.getElementById('scene-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const skyToggle = document.getElementById('sky-toggle');
const skyHint = document.getElementById('sky-hint');
let scene = null;
let frame = 0;
let night = 0;       // 0 = sunset, 1 = night
let nightTarget = 0;
let lastTick = performance.now();

function buildScene() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Size of one art pixel in CSS px
    const px = Math.max(4, Math.min(6, Math.round(Math.min(vw, vh) / 110)));
    const W = Math.ceil(vw / px);
    const H = Math.ceil(vh / px);
    const horizon = Math.round(H * 0.6);
    const landH = H - horizon;
    const rng = mulberry32(42);

    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W * px + 'px';
    canvas.style.height = H * px + 'px';

    // Sunset and night sky gradients as raw pixels; render mixes them as night falls
    const skyDay = new Uint8ClampedArray(W * H * 4);
    const skyNight = new Uint8ClampedArray(W * H * 4);
    for (let y = 0; y < horizon; y++) {
        for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4;
            skyDay.set(hexToRgb(ditherPick(SKY, y / horizon, x, y)), i);
            skyNight.set(hexToRgb(ditherPick(SKY_NIGHT, y / horizon, x, y)), i);
            skyDay[i + 3] = skyNight[i + 3] = 255;
        }
    }
    const sky = document.createElement('canvas');
    sky.width = W; sky.height = H;

    // Stars, denser toward the top
    const stars = [];
    const starCount = Math.round(W * horizon * 0.005);
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.floor(rng() * W),
            y: Math.floor(Math.pow(rng(), 1.6) * horizon * 0.6),
            twinkle: rng() < 0.3,
            phase: Math.floor(rng() * 8),
            appear: rng() * 1.2 - 0.25, // night progress at which this star shows up
        });
    }

    // Foreground layer: mountains, hills, meadow, river, static sprites
    const fg = document.createElement('canvas');
    fg.width = W; fg.height = H;
    const fctx = fg.getContext('2d');
    const a = rng() * 10, b = rng() * 10, c = rng() * 10, d = rng() * 10, e = rng() * 10;
    const snowLine = horizon - H * 0.23;

    for (let x = 0; x < W; x++) {
        // Far mountains
        const farTop = Math.round(horizon - (H * 0.16 + H * 0.06 * Math.sin(x * 0.05 + a)
            + H * 0.035 * Math.sin(x * 0.13 + b) + H * 0.015 * Math.sin(x * 0.31 + c)));
        fctx.fillStyle = '#4a3360';
        fctx.fillRect(x, farTop, 1, horizon - farTop);
        if (farTop < snowLine) {
            fctx.fillStyle = '#c9b6d6';
            fctx.fillRect(x, farTop, 1, Math.round(snowLine - farTop));
        }
        // Near hills
        const nearTop = Math.round(horizon - (H * 0.05 + H * 0.02 * Math.sin(x * 0.07 + d)
            + H * 0.012 * Math.sin(x * 0.2 + e)));
        fctx.fillStyle = '#243b33';
        fctx.fillRect(x, nearTop, 1, horizon - nearTop);
        // Occasional pine tree on the hills
        if (rng() < 0.06) {
            fctx.fillStyle = '#1a2b25';
            fctx.fillRect(x, nearTop - 4, 1, 5);
            fctx.fillRect(x - 1, nearTop - 2, 3, 2);
        }
    }

    // Meadow with grass tufts (denser up close)
    for (let y = horizon; y < H; y++) {
        const depth = (y - horizon) / landH;
        for (let x = 0; x < W; x++) {
            fctx.fillStyle = ditherPick(MEADOW, depth, x, y);
            fctx.fillRect(x, y, 1, 1);
        }
    }
    for (let i = 0; i < W * landH * 0.03; i++) {
        const depth = Math.sqrt(rng());
        const x = Math.floor(rng() * W);
        const y = horizon + 1 + Math.floor(depth * (landH - 2));
        fctx.fillStyle = depth > 0.5 ? '#5c9a48' : '#2f5a3a';
        fctx.fillRect(x, y, 1, 1);
        if (depth > 0.6) fctx.fillRect(x, y - 1, 1, 1);
    }

    // River course: winds from the mountains toward the viewer (widens with depth)
    const river = [];
    for (let y = horizon; y < H; y++) {
        const depth = (y - horizon) / landH;
        const cx = W * (0.5 - 0.18 * depth + 0.06 * Math.sin(depth * 6 + 1));
        const half = 0.5 + depth * Math.max(W * 0.07, 10);
        const bank = Math.round(1 + depth * Math.max(W * 0.02, 3));
        river.push({ y, depth, cx, half, bank, x0: Math.round(cx - half), x1: Math.round(cx + half) });
    }

    // Scene objects stand on the meadow at different depths
    const place = (sprite, cx, depth) => {
        const w = sprite[0].length, h = sprite.length;
        const foot = horizon + Math.round(depth * landH);
        return { sprite, x: Math.round(W * cx - w / 2), y: foot - h, w, h, foot };
    };
    const objects = {
        about: place(TENT, 0.17, 0.55),
        education: place(CABIN, 0.66, 0.35),
        research: place(TELESCOPE, 0.86, 0.6),
    };

    // ---- Trail: left edge -> past the tent -> bridge -> cabin door -> right edge ----
    const trng = mulberry32(7);
    const bridgeRow = river[Math.round(0.48 * (river.length - 1))];
    const tent = objects.about, cabin = objects.education;
    const trailPoints = [
        [-4, tent.foot + landH * 0.16],
        [tent.x + tent.w / 2, tent.foot + landH * 0.1],
        [bridgeRow.x0 - bridgeRow.bank - 5, bridgeRow.y],
        [bridgeRow.x1 + bridgeRow.bank + 5, bridgeRow.y],
        [cabin.x + 13, cabin.foot + 1], // the cabin door
        [cabin.x + cabin.w + 6, cabin.foot + landH * 0.12],
        [W + 4, horizon + landH * 0.5],
    ];
    // Dense samples along a Catmull-Rom curve through the points
    const trail = [];
    for (let s = 0; s < trailPoints.length - 1; s++) {
        const p0 = trailPoints[Math.max(s - 1, 0)], p1 = trailPoints[s];
        const p2 = trailPoints[s + 1], p3 = trailPoints[Math.min(s + 2, trailPoints.length - 1)];
        const n = Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 2);
        for (let i = 0; i < n; i++) {
            const t = i / n, t2 = t * t, t3 = t2 * t;
            const cr = k => 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t
                + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3);
            trail.push({ x: cr(0), y: cr(1) });
        }
    }
    // Mark the trail as a mask (2 = dirt, 1 = edge), wider up close
    const trailMask = new Uint8Array(W * H);
    trail.forEach(pt => {
        const depth = (pt.y - horizon) / landH;
        pt.w = 2 + Math.round(depth * Math.max(5, W * 0.025));
        pt.th = Math.max(1, Math.round(pt.w * 0.35));
        const x0 = Math.round(pt.x - pt.w / 2), y0 = Math.round(pt.y);
        for (let y = y0; y < y0 + pt.th; y++) {
            for (let x = x0; x < x0 + pt.w; x++) {
                if (x >= 0 && x < W && y > horizon && y < H) trailMask[y * W + x] = 2;
            }
        }
    });
    for (let y = horizon + 1; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const p = y * W + x;
            if (trailMask[p]) continue;
            if ((x > 0 && trailMask[p - 1] === 2) || (x < W - 1 && trailMask[p + 1] === 2)
                || trailMask[p - W] === 2 || (y < H - 1 && trailMask[p + W] === 2)) {
                trailMask[p] = 1;
            }
        }
    }
    for (let p = 0; p < W * H; p++) {
        if (!trailMask[p]) continue;
        const r = trng();
        fctx.fillStyle = trailMask[p] === 1 ? '#5e4630' : r < 0.12 ? '#a0805a' : r < 0.22 ? '#6e5238' : '#86664a';
        fctx.fillRect(p % W, Math.floor(p / W), 1, 1);
    }

    // Draw the river over the meadow and trail
    for (const { y, depth, cx, half, bank, x0, x1 } of river) {
        // Gravel banks
        for (let x = x0 - bank; x <= x1 + bank; x++) {
            fctx.fillStyle = GRAVEL[Math.floor(rng() * GRAVEL.length)];
            fctx.fillRect(x, y, 1, 1);
        }
        // Water: deeper (darker) in the middle and up close
        for (let x = x0; x <= x1; x++) {
            const f = (x - cx) / half;
            fctx.fillStyle = ditherPick(WATER, depth * 1.2 + (1 - f * f) * 0.35, x, y);
            fctx.fillRect(x, y, 1, 1);
        }
        // Wet edge where water meets the bank
        fctx.fillStyle = '#2a3a4a';
        fctx.fillRect(x0 - 1, y, 1, 1);
        fctx.fillRect(x1 + 1, y, 1, 1);
    }

    // Rocks along the banks (bigger up close)
    for (let i = 0; i < landH * 1.5; i++) {
        const row = river[Math.floor(Math.sqrt(rng()) * river.length)];
        const s = Math.max(1, Math.round(row.depth * (1 + rng() * 2.5)));
        const off = Math.floor(rng() * (row.bank + 1));
        const x = rng() < 0.5 ? row.x0 - off - s + 1 : row.x1 + off;
        drawRock(fctx, x, row.y - s + 1, s);
    }

    // Boulders in the water (left side, to keep the fisher's spot clear); foam is animated in render
    const boulders = [];
    for (let i = 0; i < 5; i++) {
        const row = river[Math.floor((0.3 + rng() * 0.65) * river.length)];
        const s = Math.max(2, Math.round(row.depth * 4));
        const x = Math.round(row.cx + (-0.6 + rng() * 0.7) * row.half - s / 2);
        if (Math.abs(row.y - bridgeRow.y) < s + 4) continue; // keep the bridge clear
        drawRock(fctx, x, row.y - s + 1, s);
        boulders.push({ x, y: row.y + 1, s });
    }

    // Wooden bridge where the trail crosses: plank deck, back rail with posts, shadow on the water
    const deckH = trail.find(pt => pt.x >= bridgeRow.cx).th + 2;
    const bridge = {
        x0: bridgeRow.x0 - bridgeRow.bank - 2,
        x1: bridgeRow.x1 + bridgeRow.bank + 2,
        deckTop: bridgeRow.y - 1,
    };
    bridge.y0 = bridge.deckTop - 3;          // top of the railing
    bridge.y1 = bridge.deckTop + deckH;      // shadow row
    fctx.fillStyle = '#1a2a40';
    fctx.fillRect(bridgeRow.x0, bridge.y1, bridgeRow.x1 - bridgeRow.x0 + 1, 1);
    for (let x = bridge.x0; x <= bridge.x1; x++) {
        fctx.fillStyle = x % 2 ? '#8b5a34' : '#7a4c2c';
        fctx.fillRect(x, bridge.deckTop, 1, deckH - 1);
    }
    fctx.fillStyle = '#4a2f1c';
    fctx.fillRect(bridge.x0, bridge.deckTop + deckH - 1, bridge.x1 - bridge.x0 + 1, 1);
    fctx.fillRect(bridge.x0, bridge.y0, bridge.x1 - bridge.x0 + 1, 1);
    for (let x = bridge.x0; x <= bridge.x1; x += 4) fctx.fillRect(x, bridge.y0, 1, 3);
    fctx.fillRect(bridge.x1, bridge.y0, 1, 3);

    // Shimmer spots and downstream-flowing ripples on the water
    const onBridge = y => y >= bridge.y0 - 1 && y <= bridge.y1;
    const shimmer = [];
    for (let i = 0; i < landH * 0.8; i++) {
        const row = river[Math.floor(rng() * river.length)];
        if (row.x1 - row.x0 < 2 || onBridge(row.y)) continue;
        shimmer.push({
            x: row.x0 + 1 + Math.floor(rng() * (row.x1 - row.x0 - 1)),
            y: row.y,
            phase: Math.floor(rng() * 6),
        });
    }
    const ripples = [];
    for (let i = 0; i < Math.max(12, landH * 0.6); i++) {
        ripples.push({ f: rng() * 1.4 - 0.7, t: rng() });
    }

    // Jumping trout, between the bridge and the fisher (left of the fly's drift line)
    const jr = river[Math.round(0.62 * (river.length - 1))];
    const fish = {
        x0: Math.round(jr.cx - jr.half * 0.5),
        y: jr.y,
        span: Math.round(Math.min(8 + jr.depth * 5, jr.half * 1.1)),
        h: 5 + Math.round(jr.depth * 5),
    };

    // Fly fisher standing waist-deep near the right bank
    const fisherRow = Math.round(0.82 * (river.length - 1));
    const fr = river[fisherRow];
    const fisher = {
        x: Math.round(fr.cx + fr.half * 0.4 - FISHER[0].length / 2),
        y: fr.y - FISHER.length + 1,
        row: fisherRow,
    };

    Object.values(objects).forEach(o => {
        fctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // ground shadow
        fctx.fillRect(o.x, o.y + o.h - 1, o.w, 2);
        drawSprite(fctx, o.sprite, o.x, o.y);
    });

    const fire = {
        x: objects.about.x - FIRE_FRAMES[0][0].length - 2,
        y: objects.about.y + objects.about.h - FIRE_FRAMES[0].length,
    };

    // ---- Pine trees and wildflowers in the open meadow ----
    // Keep clear of the objects (and their labels), the campfire, and the fisher's casting area
    const reserved = [
        ...Object.values(objects).map(o => ({ x0: o.x - 3, y0: o.y - 10, x1: o.x + o.w + 2, y1: o.y + o.h + 2 })),
        { x0: fire.x - 3, y0: fire.y - 4, x1: objects.about.x, y1: fire.y + FIRE_FRAMES[0].length + 2 },
        { x0: fisher.x - 18, y0: fisher.y - 14, x1: fisher.x + FISHER[0].length + 14, y1: fisher.y + FISHER.length + 2 },
    ];
    const blocked = (x0, y0, x1, y1) => {
        if (reserved.some(r => x1 >= r.x0 && x0 <= r.x1 && y1 >= r.y0 && y0 <= r.y1)) return true;
        for (let y = Math.max(y0, horizon); y <= Math.min(y1, H - 1); y++) {
            const r = river[y - horizon];
            if (x1 >= r.x0 - r.bank - 2 && x0 <= r.x1 + r.bank + 2) return true;
            for (let x = Math.max(x0, 0); x <= Math.min(x1, W - 1); x++) {
                if (trailMask[y * W + x]) return true;
            }
        }
        return false;
    };

    // Lamp posts alternating sides of the trail; their lights are drawn in render
    const lamps = [];
    const spacing = Math.max(22, W / 6);
    let dist = spacing / 2, side = 1;
    for (let i = 1; i < trail.length; i++) {
        const pt = trail[i];
        dist += Math.hypot(pt.x - trail[i - 1].x, pt.y - trail[i - 1].y);
        if (dist < spacing) continue;
        const depth = (pt.y - horizon) / landH;
        const x = Math.round(pt.x);
        const h = 4 + Math.round(depth * 4);
        if (x < 2 || x > W - 3) continue;
        // Find a ground spot just off the trail, preferring the current side but trying the other too.
        // The spot must be off the trail/river; the full post must stay clear of objects and labels.
        const findFoot = s => {
            for (let k = 0; k < 4; k++) {
                const foot = s > 0 ? Math.round(pt.y) - 2 - k : Math.round(pt.y) + pt.th + 2 + k;
                if (foot >= H - 1) return null;
                const hitsReserved = reserved.some(r => x + 1 >= r.x0 && x - 1 <= r.x1 && foot >= r.y0 && foot - h - 4 <= r.y1);
                if (!hitsReserved && !blocked(x - 1, foot - 1, x + 1, foot)) return foot;
            }
            return null;
        };
        let foot = findFoot(side);
        if (foot === null) foot = findFoot(-side);
        else side = -side;
        if (foot === null) continue;
        dist = 0;
        // Tiki torch: banded bamboo pole with a woven cup on top (flame is drawn in render)
        for (let y = foot - h + 2; y <= foot; y++) {
            fctx.fillStyle = y % 3 === 0 ? '#8a6a3a' : '#c9a66b';
            fctx.fillRect(x, y, 1, 1);
        }
        fctx.fillStyle = '#8a5a30';
        fctx.fillRect(x - 1, foot - h, 3, 1);
        fctx.fillStyle = '#5a3a22';
        fctx.fillRect(x - 1, foot - h + 1, 3, 1);
        lamps.push({ x, foot, headY: foot - h, phase: lamps.length });
        reserved.push({ x0: x - 2, y0: foot - h - 4, x1: x + 2, y1: foot + 1 });
    }

    // Trees: smaller toward the horizon, often in small groves
    const trees = [];
    for (let tries = 0; trees.length < Math.round(W / 14) && tries < 500; tries++) {
        const near = trees.length && rng() < 0.4 ? trees[Math.floor(rng() * trees.length)] : null;
        const depth = near ? (near.base - horizon) / landH + (rng() - 0.5) * 0.1 : 0.03 + rng() * 0.97;
        if (depth < 0.02 || depth > 1) continue;
        const base = horizon + Math.round(depth * (landH - 1));
        const h = Math.round(6 + depth * Math.min(14, landH * 0.3) + rng() * 3);
        const half = Math.ceil(h * 0.45);
        const cx = near ? near.cx + Math.round((rng() < 0.5 ? -1 : 1) * (half + 1 + rng() * 3)) : Math.floor(rng() * W);
        if (blocked(cx - half - 1, base - h, cx + half + 1, base + 1)) continue;
        trees.push({ cx, base, h });
    }
    // Extra woods on the left, behind the trail and tent
    const tentRight = objects.about.x + objects.about.w + 6;
    const tentDepth = (objects.about.foot - horizon) / landH;
    const leftGoal = trees.length + Math.round(W / 30) + 4;
    for (let tries = 0; trees.length < leftGoal && tries < 600; tries++) {
        const depth = 0.03 + rng() * (tentDepth - 0.05);
        const base = horizon + Math.round(depth * (landH - 1));
        const h = Math.round(6 + depth * Math.min(14, landH * 0.3) + rng() * 3);
        const half = Math.ceil(h * 0.45);
        const cx = Math.floor(rng() * tentRight);
        if (blocked(cx - half - 1, base - h, cx + half + 1, base + 1)) continue;
        trees.push({ cx, base, h });
        reserved.push({ x0: cx - 1, y0: base - 1, x1: cx + 1, y1: base + 1 }); // avoid stacking trunks
    }
    trees.sort((p, q) => p.base - q.base).forEach(t => {
        drawPine(fctx, t.cx, t.base, t.h);
        const half = Math.ceil(t.h * 0.45);
        reserved.push({ x0: t.cx - half, y0: t.base - t.h, x1: t.cx + half, y1: t.base + 1 });
    });

    // Flowers: small same-color patches, bigger blooms up close
    for (let i = 0; i < W * 0.15; i++) {
        const depth = Math.sqrt(rng());
        const cy = horizon + 2 + Math.round(depth * (landH - 3));
        const cx = rng() * W;
        const color = FLOWERS[Math.floor(rng() * FLOWERS.length)];
        const n = 2 + Math.floor(rng() * 4);
        for (let j = 0; j < n; j++) {
            const x = Math.round(cx + (rng() - 0.5) * 7);
            const y = Math.round(cy + (rng() - 0.5) * 3);
            if (y >= H || blocked(x - 1, y - 3, x + 1, y)) continue;
            fctx.fillStyle = '#2f5a3a';
            fctx.fillRect(x, y, 1, 1);
            fctx.fillStyle = color;
            if (depth > 0.7) {
                fctx.fillRect(x - 1, y - 2, 3, 1);
                fctx.fillRect(x, y - 3, 1, 3);
                fctx.fillStyle = '#ffd25a';
                if (color === '#ffd25a') fctx.fillStyle = '#b0532a';
                fctx.fillRect(x, y - 2, 1, 1);
            } else {
                fctx.fillRect(x, y - 1, 1, 1);
            }
        }
    }

    // Pixels that get the night tint: everything in the foreground except lit windows/lantern
    const fgAlpha = fctx.getImageData(0, 0, W, H).data;
    const tintable = new Uint8Array(W * H);
    for (let p = 0; p < W * H; p++) tintable[p] = fgAlpha[p * 4 + 3] > 0 ? 1 : 0;
    Object.values(objects).forEach(o => {
        o.sprite.forEach((row, j) => [...row].forEach((ch, i) => {
            const x = o.x + i, y = o.y + j;
            if (GLOW.includes(ch) && x >= 0 && x < W && y >= 0 && y < H) tintable[y * W + x] = 0;
        }));
    });

    const sun = { x: Math.round(W * 0.3), r: Math.max(4, Math.round(H * 0.04)) };
    const moon = { x: Math.round(W * 0.78), r: Math.max(3, Math.round(H * 0.03)) };
    // Black hole: rs is the shadow radius; with its rings it ends up slightly smaller than the sun
    const blackHole = { x: Math.round(W * 0.55), y: Math.round(H * 0.2), rs: Math.max(2, sun.r - 4) };

    // Position the clickable buttons over the sprites
    document.querySelectorAll('.scene-obj').forEach(btn => {
        const o = objects[btn.dataset.section];
        Object.assign(btn.style, {
            left: o.x * px + 'px',
            top: o.y * px + 'px',
            width: o.w * px + 'px',
            height: o.h * px + 'px',
        });
    });

    scene = {
        W, H, px, horizon, sky, skyDay, skyNight, skyLevel: -1, fg, tintable,
        stars, sun, moon, blackHole, shimmer, ripples, boulders, river, fisher, fish, fire, lamps, onBridge,
    };
}

// Trout jump: every FISH_CYCLE frames it leaps for FISH_JUMP frames, with splashes on exit and entry
const FISH_CYCLE = 72;
const FISH_JUMP = 10;
const FISH_START = 20; // offset so it doesn't sync with the fisher's cast

function drawSplash(ctx, x, y, step) {
    ctx.fillStyle = '#dfe9f2';
    const r = step + 1;
    ctx.fillRect(x - r, y, 1, 1);
    ctx.fillRect(x + r, y, 1, 1);
    if (step < 2) {
        ctx.fillRect(x - step, y - r, 1, 1); // droplets
        ctx.fillRect(x + step, y - r - 1, 1, 1);
    }
}

function drawFish(ctx, { fish }) {
    const k = (frame - FISH_START + FISH_CYCLE * 100) % FISH_CYCLE;
    const xEnd = fish.x0 + fish.span;
    if (k < 3) drawSplash(ctx, fish.x0, fish.y, k);                       // exit splash
    if (k >= FISH_JUMP && k < FISH_JUMP + 3) drawSplash(ctx, xEnd, fish.y, k - FISH_JUMP); // entry splash
    if (k >= FISH_JUMP) return;

    // Parabolic arc; the body points along the direction of travel
    const t = (k + 0.5) / FISH_JUMP;
    const cx = fish.x0 + fish.span * t;
    const cy = fish.y - 4 * fish.h * t * (1 - t);
    const ang = Math.atan2(-4 * fish.h * (1 - 2 * t), fish.span);
    const dx = Math.cos(ang), dy = Math.sin(ang);
    // Head, pink side stripe, tail (7 px long), with an olive back and silver belly
    const body = ['#d8dde5', '#c0c8d0', '#e08a9a', '#e08a9a', '#e08a9a', '#8a9ab0', '#6a7a90'];
    const px = Math.round(-dy), py = Math.round(dx); // perpendicular, toward the belly
    body.forEach((color, i) => {
        const x = Math.round(cx + dx * (3 - i)), y = Math.round(cy + dy * (3 - i));
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
        if (i >= 1 && i <= 4) {
            ctx.fillStyle = '#c0c8d0'; // belly
            ctx.fillRect(x + px, y + py, 1, 1);
        }
        if (i >= 2 && i <= 5) {
            ctx.fillStyle = '#5e7a5a'; // back
            ctx.fillRect(x - px, y - py, 1, 1);
        }
        if (i === 6) {
            ctx.fillStyle = '#6a7a90'; // forked tail fin
            ctx.fillRect(x - px, y - py, 1, 1);
            ctx.fillRect(x + px, y + py, 1, 1);
            ctx.fillRect(x - 2 * px - Math.round(dx), y - 2 * py - Math.round(dy), 1, 1);
            ctx.fillRect(x + 2 * px - Math.round(dx), y + 2 * py - Math.round(dy), 1, 1);
        }
    });
}

// Two flicker frames of torch flame, as [dx, dy, color] relative to the cup top
const TORCH_FLAMES = [
    [[0, -3, '#d9452b'], [-1, -2, '#ff9a3c'], [0, -2, '#ffd25a'], [1, -2, '#d9452b'],
        [-1, -1, '#ff9a3c'], [0, -1, '#ffd25a'], [1, -1, '#ff9a3c']],
    [[1, -3, '#d9452b'], [-1, -2, '#d9452b'], [0, -2, '#ff9a3c'], [1, -2, '#ffd25a'],
        [-1, -1, '#ff9a3c'], [0, -1, '#ffd25a'], [1, -1, '#ff9a3c']],
];

// Torches light as night falls: a small flame catches, grows, and casts a warm glow
function drawLamps(ctx) {
    const lit = Math.max(0, Math.min((night - 0.3) / 0.3, 1));
    const slow = frame >> 1;
    scene.lamps.forEach(l => {
        if (lit < 0.1) return;
        const cy = l.headY - 2;
        ctx.fillStyle = '#ffa64d';
        // Faint outer glow, then a brighter inner halo around the flame
        ctx.globalAlpha = lit * 0.12;
        ctx.fillRect(l.x - 4, cy - 2, 9, 5);
        ctx.fillRect(l.x - 2, cy - 4, 5, 9);
        ctx.globalAlpha = lit * 0.22;
        ctx.fillRect(l.x - 2, cy - 1, 5, 3);
        ctx.fillRect(l.x - 1, cy - 2, 3, 5);
        ctx.globalAlpha = 1;
        // Flame: just the base row while catching, full flickering flame once lit
        TORCH_FLAMES[(slow + l.phase) % 2].forEach(([dx, dy, c]) => {
            if (lit < 0.5 && dy < -1) return;
            ctx.fillStyle = c;
            ctx.fillRect(l.x + dx, l.headY + dy, 1, 1);
        });
        // Oval pool of light on the ground: soft outer ring, brighter center
        ctx.fillStyle = '#ffb060';
        ctx.globalAlpha = lit * 0.14;
        ctx.fillRect(l.x - 2, l.foot - 2, 5, 1);
        ctx.fillRect(l.x - 4, l.foot - 1, 9, 1);
        ctx.fillRect(l.x - 5, l.foot, 11, 1);
        ctx.fillRect(l.x - 4, l.foot + 1, 9, 1);
        ctx.fillRect(l.x - 2, l.foot + 2, 5, 1);
        ctx.fillRect(l.x - 2, l.foot - 1, 5, 3);
        ctx.globalAlpha = 1;
    });
}

// ---------- Day/night ----------
// Ordered-dither mix of the two skies; only rebuilt when the dither level changes
function skyAt(level) {
    const { W, H, sky, skyDay, skyNight } = scene;
    if (scene.skyLevel !== level) {
        const img = new ImageData(W, H);
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const i = (y * W + x) * 4;
                const src = BAYER[y % 4][x % 4] < level ? skyNight : skyDay;
                img.data.set(src.subarray(i, i + 4), i);
            }
        }
        sky.getContext('2d').putImageData(img, 0, 0);
        scene.skyLevel = level;
    }
    return sky;
}

function drawSunAndMoon(ctx, p) {
    const { horizon, H, sun, moon } = scene;
    const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(t, 1));
    // Sun sinks behind the mountains during the first half
    const sunY = Math.round(lerp(horizon - H * 0.3, horizon + sun.r + 2, p / 0.5));
    drawDisc(ctx, sun.x, sunY, sun.r + 1, '#ffb454');
    drawDisc(ctx, sun.x, sunY, sun.r, '#ffd98a');
    sun.y = sunY;
    // Moon rises during the second part
    const moonY = Math.round(lerp(horizon + moon.r + 2, H * 0.14, (p - 0.3) / 0.7));
    moon.y = moonY;
    drawDisc(ctx, moon.x, moonY, moon.r, '#f3ead8');
    ctx.fillStyle = '#cfc6b4';
    ctx.fillRect(moon.x - 1, moonY - 1, 1, 1);
    ctx.fillRect(moon.x + 1, moonY + 1, 2, 1);
    ctx.fillRect(moon.x - Math.ceil(moon.r / 2), moonY + Math.ceil(moon.r / 2) - 1, 1, 1);
}

// Black hole: glow ring, photon ring, shadow, and an accretion disk crossing in front.
// The left side of the disk is brighter (approaching side), and a hot spot orbits along it.
function drawBlackHole(ctx) {
    const { x, y, rs } = scene.blackHole;
    drawDisc(ctx, x, y, rs + 2, '#d9782f');
    drawDisc(ctx, x, y, rs + 1, '#f5d29a');
    drawDisc(ctx, x, y, rs, '#000000');

    const dW = rs + 3;
    const disk = ['#f5d29a', '#f0b060', '#e08c3a', '#c96a2a', '#a83a22'];
    for (let dx = -dW; dx <= dW; dx++) {
        // Brightest just left of center, fading toward the edges and dimmer on the right
        const fade = Math.abs(dx) / dW + (dx > 0 ? 0.25 : 0);
        ctx.fillStyle = disk[Math.min(disk.length - 1, Math.floor(fade * disk.length))];
        ctx.fillRect(x + dx, y, 1, 1);
        if (rs >= 3 && Math.abs(dx) < dW - 1) {
            ctx.fillStyle = disk[Math.min(disk.length - 1, Math.floor(fade * disk.length) + 1)];
            ctx.fillRect(x + dx, y + 1, 1, 1);
        }
    }
    const spot = dW - (frame % (2 * dW + 1)); // orbits right to left across the front
    ctx.fillStyle = '#fff0d0';
    ctx.fillRect(x + spot, y, 1, 1);
}

// Smoothly shift foreground pixels toward moonlit blue by amount (0..1)
function applyNightTint(amount) {
    if (amount === 0) return;
    const { W, H, tintable } = scene;
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    for (let p = 0; p < W * H; p++) {
        if (!tintable[p]) continue;
        const i = p * 4;
        d[i] += (d[i] * 0.3 + 8 - d[i]) * amount;
        d[i + 1] += (d[i + 1] * 0.38 + 12 - d[i + 1]) * amount;
        d[i + 2] += (d[i + 2] * 0.55 + 34 - d[i + 2]) * amount;
    }
    ctx.putImageData(img, 0, 0);
}

// Keep the clickable sun/moon button over whichever one is currently up
function placeSkyToggle() {
    const { px, horizon, sun, moon } = scene;
    const isDay = night < 0.5;
    const body = isDay ? { x: sun.x, y: sun.y, r: sun.r + 1 } : moon;
    Object.assign(skyToggle.style, {
        display: body.y - body.r >= horizon ? 'none' : 'block',
        left: (body.x - body.r) * px + 'px',
        top: (body.y - body.r) * px + 'px',
        width: (2 * body.r + 1) * px + 'px',
        height: (2 * body.r + 1) * px + 'px',
    });
    const label = isDay ? 'Night' : 'Sunset';
    if (skyToggle.textContent !== label) {
        skyToggle.firstElementChild.textContent = label;
        skyToggle.setAttribute('aria-label', 'Switch to ' + label.toLowerCase());
        skyHint.textContent = isDay ? '> click the sun to watch it set' : '> click the moon to bring back the sunset';
    }
}

skyToggle.addEventListener('click', () => {
    nightTarget = nightTarget ? 0 : 1;
    if (reducedMotion) {
        night = nightTarget;
        render();
    }
});

// Fly fishing cycle (in frames): back cast, forward cast, then the fly drifts downstream
const CAST_CYCLE = 48;

function drawFisher(ctx, { fisher, river }) {
    const { x, y } = fisher;
    const k = frame % CAST_CYCLE;
    const hand = { x: x + 1, y: y + 7 };
    const rodColor = '#3a2a1a';
    const lineColor = '#e8e0c8';

    // Small wake around the waders
    ctx.fillStyle = '#9fd3ff';
    for (let i = 2 + (frame >> 1) % 2; i < FISHER[0].length - 2; i += 2) {
        ctx.fillRect(x + i, y + FISHER.length, 1, 1);
    }
    drawSprite(ctx, FISHER, x, y);

    if (k < 4) {
        // Back cast: rod up and behind, line looping behind the fisher
        const tip = { x: hand.x + 4, y: hand.y - 11 };
        drawCurve(ctx, hand.x, hand.y, hand.x + 1, hand.y - 6, tip.x, tip.y, rodColor);
        drawCurve(ctx, tip.x, tip.y, tip.x + 5, tip.y - 4, tip.x + 9, tip.y + 2, lineColor);
        return;
    }

    const tip = { x: hand.x - 7, y: hand.y - 8 };
    drawCurve(ctx, hand.x, hand.y, hand.x - 3, hand.y - 6, tip.x, tip.y, rodColor);

    // The fly lands upstream and drifts toward the viewer
    const drift = k < 6 ? 0 : (k - 6) / (CAST_CYCLE - 6);
    const row = river[Math.max(0, fisher.row - 10 + Math.round(drift * 8))];
    const fly = { x: Math.round(row.cx - row.half * 0.2), y: row.y };
    if (k < 6) {
        // Forward cast: line still in the air
        drawCurve(ctx, tip.x, tip.y, (tip.x + fly.x) / 2, tip.y - 3, fly.x, fly.y - 4, lineColor);
        return;
    }
    drawCurve(ctx, tip.x, tip.y, tip.x - 1, fly.y, fly.x, fly.y, lineColor);
    ctx.fillStyle = '#ff6a3c';
    ctx.fillRect(fly.x, fly.y, 1, 1);
}

function tick() {
    frame++;
    const now = performance.now();
    const step = (now - lastTick) / FADE_MS;
    lastTick = now;
    if (nightTarget > night) night = Math.min(night + step, 1);
    else if (nightTarget < night) night = Math.max(night - step, 0);
    scene.ripples.forEach(r => {
        r.t += 0.003 + 0.006 * r.t;
        if (r.t >= 1) r.t = 0.15;
    });
}

function render() {
    const { fg, stars, shimmer, ripples, boulders, river, fire } = scene;
    const slow = frame >> 1; // twinkle, flicker and shimmer run at half speed
    const level = Math.round(night * 16); // sky uses stepped dither levels
    ctx.drawImage(skyAt(level), 0, 0);
    stars.forEach(s => {
        if (s.appear > night) return;
        const dim = s.twinkle && (slow + s.phase) % 8 < 2;
        ctx.fillStyle = dim ? '#6b6a9a' : '#f3ead8';
        ctx.fillRect(s.x, s.y, 1, 1);
    });
    drawSunAndMoon(ctx, night);
    drawBlackHole(ctx);
    ctx.drawImage(fg, 0, 0);

    ctx.fillStyle = '#9fd3ff';
    shimmer.forEach(s => {
        if ((slow + s.phase) % 6 === 0) ctx.fillRect(s.x, s.y, 1, 1);
    });
    ctx.fillStyle = '#6a93c9';
    ripples.forEach(r => {
        const row = river[Math.floor(r.t * (river.length - 1))];
        if (row.depth < 0.2 || scene.onBridge(row.y)) return;
        const len = 1 + Math.round(row.depth * 3);
        ctx.fillRect(Math.round(row.cx + r.f * row.half - len / 2), row.y, len, 1);
    });
    ctx.fillStyle = '#dfe9f2';
    boulders.forEach((b, i) => {
        for (let dx = -1; dx <= b.s; dx++) {
            if ((slow + dx + i) % 3 !== 0) ctx.fillRect(b.x + dx, b.y, 1, 1);
            if ((slow + dx + i) % 4 === 0) ctx.fillRect(b.x + dx, b.y + 1, 1, 1);
        }
    });

    drawFish(ctx, scene);
    drawFisher(ctx, scene);
    applyNightTint(night);
    drawLamps(ctx);
    drawSprite(ctx, FIRE_FRAMES[slow % 2], fire.x, fire.y); // fire stays lit
    placeSkyToggle();
}

buildScene();
render();

if (!reducedMotion) {
    setInterval(() => { tick(); render(); }, 125);
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildScene(); render(); }, 100);
});

// ---------- Dialog ----------
const dialog = document.getElementById('dialog');
const dialogContent = document.getElementById('dialog-content');

function showContent(section) {
    dialogContent.replaceChildren(document.getElementById('tpl-' + section).content.cloneNode(true));
    dialogContent.scrollTop = 0;
    dialog.querySelectorAll('.dialog-tabs button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });
    if (!dialog.open) dialog.showModal();
}

document.querySelectorAll('[data-section]').forEach(btn => {
    btn.addEventListener('click', () => showContent(btn.dataset.section));
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
// Click on the backdrop closes the dialog
dialog.addEventListener('click', e => {
    const r = dialog.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (outside) dialog.close();
});

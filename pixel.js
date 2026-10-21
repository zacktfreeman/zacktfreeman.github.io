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

    // River winding from the mountains toward the viewer (widens with depth)
    const river = [];
    for (let y = horizon; y < H; y++) {
        const depth = (y - horizon) / landH;
        const cx = W * (0.5 - 0.18 * depth + 0.06 * Math.sin(depth * 6 + 1));
        const half = 0.5 + depth * Math.max(W * 0.07, 10);
        const bank = Math.round(1 + depth * Math.max(W * 0.02, 3));
        const x0 = Math.round(cx - half);
        const x1 = Math.round(cx + half);
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
        river.push({ y, depth, cx, half, bank, x0, x1 });
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
        drawRock(fctx, x, row.y - s + 1, s);
        boulders.push({ x, y: row.y + 1, s });
    }

    // Shimmer spots and downstream-flowing ripples on the water
    const shimmer = [];
    for (let i = 0; i < landH * 0.8; i++) {
        const row = river[Math.floor(rng() * river.length)];
        if (row.x1 - row.x0 < 2) continue;
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

    // Fly fisher standing waist-deep near the right bank
    const fisherRow = Math.round(0.82 * (river.length - 1));
    const fr = river[fisherRow];
    const fisher = {
        x: Math.round(fr.cx + fr.half * 0.4 - FISHER[0].length / 2),
        y: fr.y - FISHER.length + 1,
        row: fisherRow,
    };

    // Scene objects stand on the meadow at different depths
    const place = (sprite, cx, depth) => {
        const w = sprite[0].length, h = sprite.length;
        const foot = horizon + Math.round(depth * landH);
        return { sprite, x: Math.round(W * cx - w / 2), y: foot - h, w, h };
    };
    const objects = {
        about: place(TENT, 0.17, 0.55),
        education: place(CABIN, 0.66, 0.35),
        research: place(TELESCOPE, 0.86, 0.6),
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
        stars, sun, moon, shimmer, ripples, boulders, river, fisher, fire,
    };
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
    ctx.drawImage(fg, 0, 0);

    ctx.fillStyle = '#9fd3ff';
    shimmer.forEach(s => {
        if ((slow + s.phase) % 6 === 0) ctx.fillRect(s.x, s.y, 1, 1);
    });
    ctx.fillStyle = '#6a93c9';
    ripples.forEach(r => {
        const row = river[Math.floor(r.t * (river.length - 1))];
        if (row.depth < 0.2) return;
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

    drawFisher(ctx, scene);
    applyNightTint(night);
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

// ---------- Sprites ('.' = transparent, other chars map to COLORS) ----------
const COLORS = {
    // tent
    o: '#e8803a', d: '#b0532a', k: '#1e1420',
    // campfire
    r: '#d9452b', f: '#ff9a3c', y: '#ffd25a', b: '#6b4226',
    // cabin
    R: '#7a2e2e', B: '#8b5a34', Y: '#ffd86b', K: '#3a2416',
    // telescope
    g: '#8a8aa0', w: '#d8d8e0', t: '#2a2a3a',
};

const TENT = [
    '.....o.....',
    '....ood....',
    '...ooodd...',
    '..oookddd..',
    '.oookkkddd.',
    'ooookkkdddd',
];

const FIRE_FRAMES = [
    ['..r..', '.rff.', '.fyf.', 'rfyyr', '.bbb.'],
    ['.r...', '..fr.', '.fyf.', 'rfyfr', '.bbb.'],
];

const CABIN = [
    '......R......',
    '.....RRR.....',
    '....RRRRR....',
    '...RRRRRRR...',
    '..RRRRRRRRR..',
    '.RRRRRRRRRRR.',
    '..BBBBBBBBB..',
    '..BYYBBBKKB..',
    '..BYYBBBKKB..',
    '..BBBBBBKKB..',
];

const TELESCOPE = [
    '........gw',
    '......ggw.',
    '....gggw..',
    '..tggg....',
    '....t.....',
    '...ttt....',
    '..t.t.t...',
    '.t..t..t..',
    't...t...t.',
];

// Sky goes from night (top) to sunset (horizon)
const SKY = ['#0b0f2e', '#141541', '#1f1b52', '#3a2a63', '#6b3a6e', '#b5536b', '#e9824f', '#f6b26b'];
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

function drawSprite(ctx, rows, x, y) {
    rows.forEach((row, j) => {
        [...row].forEach((c, i) => {
            if (c === '.') return;
            ctx.fillStyle = COLORS[c];
            ctx.fillRect(x + i, y + j, 1, 1);
        });
    });
}

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// ---------- Scene ----------
const canvas = document.getElementById('scene-canvas');
const ctx = canvas.getContext('2d');
let scene = null;
let frame = 0;

function buildScene() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Size of one art pixel in CSS px
    const px = Math.max(4, Math.min(6, Math.round(Math.min(vw, vh) / 110)));
    const W = Math.ceil(vw / px);
    const H = Math.ceil(vh / px);
    const groundY = Math.round(H * 0.8);
    const rng = mulberry32(42);

    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W * px + 'px';
    canvas.style.height = H * px + 'px';

    // Background layer: dithered sky gradient
    const sky = document.createElement('canvas');
    sky.width = W; sky.height = H;
    const sctx = sky.getContext('2d');
    const img = sctx.createImageData(W, H);
    const skyRgb = SKY.map(hexToRgb);
    for (let y = 0; y < H; y++) {
        const v = Math.min(y / groundY, 1) * (SKY.length - 1);
        const idx = Math.floor(v);
        const frac = v - idx;
        for (let x = 0; x < W; x++) {
            const pick = frac > (BAYER[y % 4][x % 4] + 0.5) / 16 ? Math.min(idx + 1, SKY.length - 1) : idx;
            const [r, g, b] = skyRgb[pick];
            const p = (y * W + x) * 4;
            img.data[p] = r; img.data[p + 1] = g; img.data[p + 2] = b; img.data[p + 3] = 255;
        }
    }
    sctx.putImageData(img, 0, 0);

    // Stars, denser toward the top
    const stars = [];
    const starCount = Math.round(W * H * 0.004);
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.floor(rng() * W),
            y: Math.floor(Math.pow(rng(), 1.6) * H * 0.55),
            twinkle: rng() < 0.3,
            phase: Math.floor(rng() * 8),
        });
    }

    // Foreground layer: mountains, hills, ground, static sprites
    const fg = document.createElement('canvas');
    fg.width = W; fg.height = H;
    const fctx = fg.getContext('2d');
    const a = rng() * 10, b = rng() * 10, c = rng() * 10, d = rng() * 10, e = rng() * 10;
    const snowLine = groundY - H * 0.34;

    for (let x = 0; x < W; x++) {
        // Far mountains
        const farTop = Math.round(groundY - (H * 0.22 + H * 0.08 * Math.sin(x * 0.05 + a)
            + H * 0.05 * Math.sin(x * 0.13 + b) + H * 0.02 * Math.sin(x * 0.31 + c)));
        fctx.fillStyle = '#4a3360';
        fctx.fillRect(x, farTop, 1, groundY - farTop);
        if (farTop < snowLine) {
            fctx.fillStyle = '#c9b6d6';
            fctx.fillRect(x, farTop, 1, Math.round(snowLine - farTop));
        }
        // Near hills
        const nearTop = Math.round(groundY - (H * 0.07 + H * 0.03 * Math.sin(x * 0.07 + d)
            + H * 0.015 * Math.sin(x * 0.2 + e)));
        fctx.fillStyle = '#243b33';
        fctx.fillRect(x, nearTop, 1, groundY - nearTop);
        // Occasional pine tree on the hills
        if (rng() < 0.06) {
            fctx.fillStyle = '#1a2b25';
            fctx.fillRect(x, nearTop - 4, 1, 5);
            fctx.fillRect(x - 1, nearTop - 2, 3, 2);
        }
    }

    // Ground
    fctx.fillStyle = '#5c9a48';
    fctx.fillRect(0, groundY, W, 1);
    fctx.fillStyle = '#3d6b3a';
    fctx.fillRect(0, groundY + 1, W, 2);
    fctx.fillStyle = '#4a3426';
    fctx.fillRect(0, groundY + 3, W, H - groundY - 3);
    fctx.fillStyle = '#3a281d';
    for (let i = 0; i < W * 0.6; i++) {
        fctx.fillRect(Math.floor(rng() * W), groundY + 4 + Math.floor(rng() * (H - groundY - 4)), 1, 1);
    }

    // Scene objects (sprites stand on the ground line)
    const place = (sprite, cx) => ({
        sprite,
        x: Math.round(W * cx - sprite[0].length / 2),
        y: groundY - sprite.length,
        w: sprite[0].length,
        h: sprite.length,
    });
    const objects = {
        about: place(TENT, 0.2),
        education: place(CABIN, 0.5),
        research: place(TELESCOPE, 0.8),
    };
    Object.values(objects).forEach(o => drawSprite(fctx, o.sprite, o.x, o.y));

    const fire = { x: objects.about.x + objects.about.w + 2, y: groundY - FIRE_FRAMES[0].length };

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

    scene = { sky, fg, stars, fire };
}

function render() {
    const { sky, fg, stars, fire } = scene;
    ctx.drawImage(sky, 0, 0);
    stars.forEach(s => {
        const dim = s.twinkle && (frame + s.phase) % 8 < 2;
        ctx.fillStyle = dim ? '#6b6a9a' : '#f3ead8';
        ctx.fillRect(s.x, s.y, 1, 1);
    });
    ctx.drawImage(fg, 0, 0);
    drawSprite(ctx, FIRE_FRAMES[frame % 2], fire.x, fire.y);
}

buildScene();
render();

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => { frame++; render(); }, 250);
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

const fs = require('fs');
const https = require('https');
const path = require('path');

const pieces = [
  { name: 'wl', url: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg', type: 'p', color: 'w' },
  { name: 'wr', url: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg', type: 'r', color: 'w' },
  { name: 'wn', url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg', type: 'n', color: 'w' },
  { name: 'wb', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg', type: 'b', color: 'w' },
  { name: 'wq', url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg', type: 'q', color: 'w' },
  { name: 'wk', url: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg', type: 'k', color: 'w' },
  { name: 'bl', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg', type: 'p', color: 'b' },
  { name: 'br', url: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg', type: 'r', color: 'b' },
  { name: 'bn', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg', type: 'n', color: 'b' },
  { name: 'bb', url: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg', type: 'b', color: 'b' },
  { name: 'bq', url: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg', type: 'q', color: 'b' },
  { name: 'bk', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg', type: 'k', color: 'b' }
];

const dir = path.join(__dirname, 'public', 'pieces');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function download() {
  for (const p of pieces) {
    const filePath = path.join(dir, `${p.color}${p.type}.svg`);
    await new Promise((resolve) => {
      https.get(p.url, (res) => {
        const file = fs.createWriteStream(filePath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      });
    });
  }
}

download().then(() => console.log('Done'));

import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const lessonsPath = path.join(projectRoot, 'lessons.json');
const imagesDir = path.join(projectRoot, 'public', 'images');

function sanitizeSeed(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function download(url, destPath, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(url, (res) => {
      const { statusCode, headers } = res;
      if ([301, 302, 303, 307, 308].includes(statusCode) && headers.location && redirectsLeft > 0) {
        // Follow redirect
        file.close(() => {
          fs.unlink(destPath, () => {
            const nextUrl = headers.location.startsWith('http') ? headers.location : new URL(headers.location, url).href;
            download(nextUrl, destPath, redirectsLeft - 1).then(resolve).catch(reject);
          });
        });
        res.resume();
        return;
      }
      if (statusCode !== 200) {
        file.close(() => {
          fs.unlink(destPath, () => reject(new Error(`HTTP ${statusCode} for ${url}`)));
        });
        res.resume();
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', (err) => {
      file.close(() => {
        fs.unlink(destPath, () => reject(err));
      });
    });
  });
}

async function run() {
  try {
    const raw = await fsPromises.readFile(lessonsPath, 'utf-8');
    const lessons = JSON.parse(raw);

    await fsPromises.mkdir(imagesDir, { recursive: true });

    for (const lesson of lessons) {
      const seed = sanitizeSeed(lesson.subject || lesson.topic || 'lesson');
      const fileName = lesson.image || `${seed}.jpg`;
      const dest = path.join(imagesDir, fileName);
      // Skip if already exists
      try {
        await fsPromises.access(dest);
        console.log(`Exists, skipping: ${fileName}`);
        continue;
      } catch (_) {}
      const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;
      console.log(`Downloading ${fileName} from ${url}`);
      await download(url, dest);
    }

    console.log('All images downloaded to public/images');
  } catch (err) {
    console.error('Image download error:', err);
    process.exitCode = 1;
  }
}

run();

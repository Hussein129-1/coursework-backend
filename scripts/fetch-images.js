import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const lessonsPath = path.join(projectRoot, 'lessons.json');
const imagesDir = path.join(projectRoot, 'public', 'images');

// Curated brand palette & iconography per lesson subject
const subjectArtwork = {
  'Mathematics': { icon: '∑', gradient: ['#4f46e5', '#4338ca'], accent: '#eef2ff', tagline: 'Numbers, logic & problem solving' },
  'English Literature': { icon: '✒️', gradient: ['#f97316', '#ea580c'], accent: '#fff7ed', tagline: 'Stories, poetry & critical thinking' },
  'Science': { icon: '🔬', gradient: ['#0ea5e9', '#0284c7'], accent: '#e0f2fe', tagline: 'Experiments to explain our world' },
  'Computer Programming': { icon: '</>', gradient: ['#7c3aed', '#5b21b6'], accent: '#ede9fe', tagline: 'Build apps, games & ideas' },
  'Art & Design': { icon: '🎨', gradient: ['#ec4899', '#db2777'], accent: '#fce7f3', tagline: 'Creative expression in every medium' },
  'Music Theory': { icon: '🎼', gradient: ['#6366f1', '#312e81'], accent: '#e0e7ff', tagline: 'Harmony, rhythm & performance' },
  'Physical Education': { icon: '⚽', gradient: ['#facc15', '#f97316'], accent: '#fefce8', tagline: 'Skills, stamina & teamwork' },
  'History': { icon: '🏛️', gradient: ['#f59e0b', '#b45309'], accent: '#fef3c7', tagline: 'Past events shaping tomorrow' },
  'Geography': { icon: '🧭', gradient: ['#14b8a6', '#0f766e'], accent: '#d1fae5', tagline: 'Places, people & environments' },
  'Spanish Language': { icon: '🌎', gradient: ['#ef4444', '#b91c1c'], accent: '#fee2e2', tagline: 'Conversation, culture & confidence' },
  'Chemistry': { icon: '⚗️', gradient: ['#22d3ee', '#0ea5e9'], accent: '#cffafe', tagline: 'Atoms, reactions & lab safety' },
  'Drama & Theatre': { icon: '🎭', gradient: ['#fb7185', '#be123c'], accent: '#ffe4e6', tagline: 'Acting, improvisation & stagecraft' },
  'Biology': { icon: '🧬', gradient: ['#84cc16', '#4d7c0f'], accent: '#ecfccb', tagline: 'Life, ecosystems & discovery' },
  'Physics': { icon: '🔭', gradient: ['#a855f7', '#6d28d9'], accent: '#ede9fe', tagline: 'Motion, energy & the universe' },
  'Economics': { icon: '📈', gradient: ['#10b981', '#047857'], accent: '#d1fae5', tagline: 'Markets, money & smart choices' }
};

function sanitizeSeed(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function run() {
  try {
    const raw = await fsPromises.readFile(lessonsPath, 'utf-8');
    const lessons = JSON.parse(raw);

    await fsPromises.mkdir(imagesDir, { recursive: true });

    for (const lesson of lessons) {
      const subject = lesson.subject || lesson.topic || 'lesson';
      const fileName = lesson.image || `${sanitizeSeed(subject)}.svg`;
      const dest = path.join(imagesDir, fileName);
      const artwork = subjectArtwork[subject] || {
        icon: '✏️',
        gradient: ['#6366f1', '#312e81'],
        accent: '#e0e7ff',
        tagline: 'Learn something amazing today'
      };

        const gradientId = `${sanitizeSeed(subject)}-gradient`;
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${artwork.gradient[0]}" />
      <stop offset="100%" stop-color="${artwork.gradient[1]}" />
    </linearGradient>
    <radialGradient id="${gradientId}-pulse" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${artwork.accent}" stop-opacity="0.85" />
      <stop offset="100%" stop-color="${artwork.accent}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="640" height="480" rx="32" fill="url(#${gradientId})" />
  <circle cx="188" cy="156" r="96" fill="url(#${gradientId}-pulse)" opacity="0.55" />
  <circle cx="500" cy="120" r="72" fill="rgba(255,255,255,0.18)" />
  <circle cx="540" cy="360" r="96" fill="rgba(255,255,255,0.12)" />
  <text x="320" y="280" text-anchor="middle" dominant-baseline="middle" font-size="200" font-family="'Poppins', 'Segoe UI', sans-serif" fill="rgba(255,255,255,0.92)" font-weight="600">${artwork.icon}</text>
</svg>`;

      console.log(`Creating ${fileName} graphic...`);
      await fsPromises.writeFile(dest, svg, 'utf-8');
    }

    // Provide an accessible fallback asset for unexpected subjects
    const fallbackPath = path.join(imagesDir, 'default-lesson.svg');
    if (!fs.existsSync(fallbackPath)) {
      await fsPromises.writeFile(
        fallbackPath,
        `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
  <defs>
    <linearGradient id="fallback-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#4338ca" />
    </linearGradient>
  </defs>
  <rect width="640" height="480" rx="32" fill="url(#fallback-gradient)" />
  <text x="320" y="240" text-anchor="middle" dominant-baseline="middle" font-size="190" font-family="'Poppins', 'Segoe UI', sans-serif" fill="rgba(255,255,255,0.92)" font-weight="600">📚</text>
</svg>`,
        'utf-8'
      );
    }

    console.log('All lesson illustrations generated in public/images');
  } catch (err) {
    console.error('Image generation error:', err);
    process.exitCode = 1;
  }
}

run();

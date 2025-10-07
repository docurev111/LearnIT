// scripts/insert_3d_page.js
// Insert a lesson_page entry whose content is a JSON payload describing a 3D model.

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'src', 'database', 'scisteps.db');
const db = new sqlite3.Database(dbPath);

// Use packaged local GLB filename from LearnITapp/assets/models
const glbUrl = 'ph_flag.glb';

const lessonId = 1;
const pageNumber = 99; // put it at the end; choose a high page number to avoid collisions

const payload = {
  type: '3d',
  title: 'Interactive 3D Model: Avocado',
  url: glbUrl,
  content: 'Rotate and zoom the 3D avocado model.'
};

db.serialize(() => {
  db.run(`INSERT INTO lesson_pages (lesson_id, page_number, title, content) VALUES (?, ?, ?, ?)`,
    [lessonId, pageNumber, payload.title, JSON.stringify(payload)], function(err) {
      if (err) {
        console.error('Error inserting 3D lesson_page:', err);
        process.exit(1);
      }
      console.log('Inserted 3D lesson_page id:', this.lastID);
      db.close();
    });
});

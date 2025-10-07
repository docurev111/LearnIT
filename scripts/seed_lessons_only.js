const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'src', 'database', 'scisteps.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('🌱 Seeding only lessons and pages for SciSteps (no data cleared)...');

  // Do NOT clear existing data to preserve users, XP, etc.

  // Assume subject, grade, quarter, unit exist; if not, insert minimally
  db.get(`SELECT id FROM subjects WHERE code = 'ESP'`, (err, row) => {
    if (err) {
      console.error('Error checking subject:', err);
      db.close();
      process.exit(1);
    }
    let subjectId = row ? row.id : null;

    if (!subjectId) {
      db.run(`INSERT INTO subjects (code, title, description) VALUES (?, ?, ?)`,
        ['ESP', 'Edukasyon sa Pagpapakatao', 'Values Education for Grade 7'],
        function(err) {
          if (err) {
            console.error('Error inserting subject:', err);
            db.close();
            process.exit(1);
          }
          subjectId = this.lastID;
          proceedWithSeeding(subjectId);
        }
      );
    } else {
      proceedWithSeeding(subjectId);
    }
  });

  function proceedWithSeeding(subjectId) {
    db.get(`SELECT id FROM grade_levels WHERE level = 7`, (err, row) => {
      if (err) {
        console.error('Error checking grade level:', err);
        db.close();
        process.exit(1);
      }
      let grade7Id = row ? row.id : null;

      if (!grade7Id) {
        db.run(`INSERT INTO grade_levels (level, name) VALUES (?, ?)`,
          [7, 'Grade 7'],
          function(err) {
            if (err) {
              console.error('Error inserting grade level:', err);
              db.close();
              process.exit(1);
            }
            grade7Id = this.lastID;
            proceedWithQuarter(grade7Id, subjectId);
          }
        );
      } else {
        proceedWithQuarter(grade7Id, subjectId);
      }
    });
  }

  function proceedWithQuarter(grade7Id, subjectId) {
    db.get(`SELECT id FROM quarters WHERE grade_level_id = ? AND quarter = 1`, [grade7Id], (err, row) => {
      if (err) {
        console.error('Error checking quarter:', err);
        db.close();
        process.exit(1);
      }
      let quarterId = row ? row.id : null;

      if (!quarterId) {
        db.run(`INSERT INTO quarters (grade_level_id, quarter) VALUES (?, ?)`,
          [grade7Id, 1],
          function(err) {
            if (err) {
              console.error('Error inserting quarter:', err);
              db.close();
              process.exit(1);
            }
            quarterId = this.lastID;
            proceedWithUnit(quarterId, subjectId);
          }
        );
      } else {
        proceedWithUnit(quarterId, subjectId);
      }
    });
  }

  function proceedWithUnit(quarterId, subjectId) {
    db.get(`SELECT id FROM units WHERE quarter_id = ? AND subject_id = ? AND title = 'Unit 1 - Isip at Kilos-loob'`, [quarterId, subjectId], (err, row) => {
      if (err) {
        console.error('Error checking unit:', err);
        db.close();
        process.exit(1);
      }
      let unitId = row ? row.id : null;

      if (!unitId) {
        db.run(`INSERT INTO units (quarter_id, subject_id, title, description) VALUES (?, ?, ?, ?)`,
          [quarterId, subjectId, 'Unit 1 - Isip at Kilos-loob', 'Panimulang talakayan sa isip at kilos-loob'],
          function(err) {
            if (err) {
              console.error('Error inserting unit:', err);
              db.close();
              process.exit(1);
            }
            unitId = this.lastID;
            seedLessons(unitId);
          }
        );
      } else {
        seedLessons(unitId);
      }
    });
  }

  function seedLessons(unitId) {
  // Clear only lesson-related data to update and reset autoincrement so IDs are predictable
  db.run("DELETE FROM lesson_pages");
  db.run("DELETE FROM lessons WHERE unit_id = ?", [unitId]);
  db.run("DELETE FROM sqlite_sequence WHERE name IN ('lessons','lesson_pages')");

    // Insert Lesson 1
    db.run(`INSERT INTO lessons (id, unit_id, title, content, duration_minutes) VALUES (?, ?, ?, ?, ?)`,
      [
        1,
        unitId,
        'Gamit ng Isip at Kilos-loob sa sariling pagpapasiya at pagkilos',
        'Gamit ng Isip at Kilos-loob sa sariling pagpapasiya at pagkilos',
        20
      ],
      function(err) {
        if (err) {
          console.error('Error inserting Lesson 1:', err);
          db.close();
          process.exit(1);
        }
  const lessonId = 1; // forced id

        // Insert Lesson 1 Pages
        const pages = [
          ['Ano ang Isip at Kilos-loob?', 'Sa araling ito, tatalakayin natin ang katangian, gamit, at tunguhin ng isip at kilos-loob. Ang isip ng tao ay higit na matalino kaysa hayop.'],
          ['Katangian ng Isip', 'Masasabing matalino ang isip ng tao dahil nagagawa nitong umunawa, magnilay, magbigay-kahulugan, magsuri, tumuklas, mag-imbento, humusga, at mangatwiran.'],
          ['Pagmumuni at Pag-unawa', 'Ang tao ay may kakayahang magnilay: magtanong sa sarili kung ano ang dapat baguhin, paano paunlarin ang sarili, at paano maging kalugod-lugod sa Diyos.'],
          ['Paglikha at Pagtuklas', 'Dahil sa malawak na imahinasyon ng tao, nagagawa niyang mag-imbento at tumuklas ng mga bagay na nakatutulong sa lipunan. Halimbawa, ang paggawa ng bakuna laban sa mga sakit.'],
          ['Pangangatwiran', 'Nagagawa ng tao na humusga at magbigay ng dahilan kung bakit tama o mali ang isang bagay. Halimbawa, pagbibigay ng opinyon tungkol sa kahirapan o pandemya.'],
          ['Tunguhin ng Isip', 'Ang tunguhin ng isip ay ang pagtuklas ng katotohanan at karunungan sa pamamagitan ng walang sawang pag-aaral at pagsasaliksik.'],
          ['Ano ang Kilos-loob?', 'Ang kilos-loob ay ang kakayahan ng tao na malayang pumili. Hindi tulad ng hayop na kumikilos batay lamang sa gutom o instinct, ang tao ay kayang magdesisyon batay sa isip at hindi lamang sa emosyon.'],
          ['Kalayaan at Pagmamahal', 'Bagamat malaya tayong pumili, ang pinakamataas na gamit ng kilos-loob ay ang pagmamahal—sa kapwa, bayan, kalikasan, at higit sa lahat sa Diyos.'],
          ['Reflection', '🤔 Paano mo magagamit ang iyong isip at kilos-loob sa paggawa ng mabuti sa iyong pamilya o paaralan?']
        ];

        pages.forEach((page, index) => {
          db.run(
            `INSERT INTO lesson_pages (lesson_id, page_number, title, content) VALUES (?, ?, ?, ?)`,
            [lessonId, index + 1, page[0], page[1]]
          );
        });

        console.log('📘 Lesson 1 seeded with pages!');

        // Insert Lesson 2
        db.run(`INSERT INTO lessons (id, unit_id, title, content, duration_minutes) VALUES (?, ?, ?, ?, ?)`,
          [
            2,
            unitId,
            'Dignidad ng Tao bilang batayan ng paggalang sa sarili, pamilya, at kapuwa',
            'Dignidad ng Tao bilang batayan ng paggalang sa sarili, pamilya, at kapuwa',
            20
          ],
          function(err) {
            if (err) {
              console.error('Error inserting Lesson 2:', err);
              db.close();
              process.exit(1);
            }
            const lesson2Id = 2; // forced id

            // Insert Lesson 2 Pages
            const lesson2Pages = [
              ['Ano ang Dignidad ng Tao?', 'Ang dignidad ng tao ay ang inherent na halaga at karapatang taglay ng bawat isa bilang nilikha ng Diyos. Ito ang pundasyon ng paggalang sa sarili, pamilya, at kapuwa.'],
              ['Dignidad sa Sarili', 'Kinabibilangan ng pagmamahal sa sarili, pagrespeto sa sariling katauhan, at pag-iwas sa mga bagay na makakasama sa buhay. Ito ay nagpapakita ng pagkilala sa sariling halaga bilang nilikha ng Diyos.'],
              ['Dignidad sa Pamilya', 'Ang pagtrato sa miyembro ng pamilya nang may pagmamahal, pag-unawa, at suporta, na nagmumula sa pagkilala sa kanilang dignidad bilang kapwa nilikha ng Diyos. Ito ay nagbubuo ng matatag na ugnayan sa tahanan.'],
              ['Dignidad sa Kapuwa', 'Ang pagtrato sa iba nang may hustisya, pagkakapantay-pantay, at pagmamahal, na nakabatay sa paniniwala na lahat ay may karapatang maging iginagalang. Ito ay sumusuporta sa pagkakaisa at kapayapaan sa lipunan.'],
              ['Paglabag sa Dignidad', 'Humahantong sa diskriminasyon, pang-aabuso, at kawalan ng pagkakapantay-pantay. Ito ay nakakasira ng relasyon at nagdudulot ng hindi pagkakasundo sa lipunan.'],
              ['Pagpapanatili ng Dignidad', 'Nagpapakita ng mabuting gawi, positibong pakikipag-ugnayan, at pagiging halimbawa sa iba. Ito ay nagdudulot ng kapayapaan at pag-unlad sa personal at komunal na antas.'],
              ['Reflection', '🤔 Paano mo isusulong ang dignidad ng tao sa iyong araw-araw na buhay, lalo na sa paaralan at pamilya?']
            ];

            lesson2Pages.forEach((page, index) => {
              db.run(
                `INSERT INTO lesson_pages (lesson_id, page_number, title, content) VALUES (?, ?, ?, ?)`,
                [lesson2Id, index + 1, page[0], page[1]]
              );
            });

            console.log('📘 Lesson 2 seeded with pages!');
            console.log('🎉 Lessons seeded without affecting users!');

            // Verify
            db.all('SELECT l.id, l.title, COUNT(lp.id) as page_count FROM lessons l LEFT JOIN lesson_pages lp ON l.id = lp.lesson_id WHERE l.unit_id = ? GROUP BY l.id', [unitId], (err, rows) => {
              if (err) {
                console.error('Error verifying:', err);
              } else {
                console.log('Seeded lessons:');
                rows.forEach(r => console.log(`Lesson ${r.id}: ${r.title} (${r.page_count} pages)`));
              }
              db.close();
            });
          }
        );
      }
    );
  }
});

// src/database/seed_mvp_fixed.js - Seeds Lesson 1 with real content
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database', 'scisteps.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('🌱 Seeding SciSteps with Lesson 1 content...');

  // Clear existing data
  db.run("DELETE FROM user_badges");
  db.run("DELETE FROM badges");
  db.run("DELETE FROM xp");
  db.run("DELETE FROM daily_signins");
  db.run("DELETE FROM class_challenges");
  db.run("DELETE FROM progress");
  db.run("DELETE FROM quizzes");
  db.run("DELETE FROM lesson_pages");
  db.run("DELETE FROM lessons");
  db.run("DELETE FROM units");
  db.run("DELETE FROM quarters");
  db.run("DELETE FROM grade_levels");
  db.run("DELETE FROM subjects");
  db.run("DELETE FROM users");

  // Insert subject - ESP
  db.run(`INSERT INTO subjects (code, title, description) VALUES (?, ?, ?)`,
    ['ESP', 'Edukasyon sa Pagpapakatao', 'Values Education for Grade 7'],
    function () {
      const subjectId = this.lastID;

      // Insert grade level
      db.run(`INSERT INTO grade_levels (level, name) VALUES (?, ?)`,
        [7, 'Grade 7'],
        function () {
          const grade7Id = this.lastID;

          // Insert Quarter 1
          db.run(`INSERT INTO quarters (grade_level_id, quarter) VALUES (?, ?)`,
            [grade7Id, 1],
            function () {
              const quarterId = this.lastID;

              // Insert Unit 1
              db.run(`INSERT INTO units (quarter_id, subject_id, title, description) VALUES (?, ?, ?, ?)`,
                [quarterId, subjectId, 'Unit 1 - Isip at Kilos-loob', 'Panimulang talakayan sa isip at kilos-loob'],
                function () {
                  const unitId = this.lastID;

                  // Insert Lesson 1
                  db.run(`INSERT INTO lessons (unit_id, title, content, duration_minutes) VALUES (?, ?, ?, ?)`,
                    [
                      unitId,
                      'Gamit ng Isip at Kilos-loob sa Sariling Pagpapasiya at Pagkilos',
                      'Araling tungkol sa katangian, gamit, at tunguhin ng isip at kilos-loob.',
                      20
                    ],
                    function () {
                      const lessonId = this.lastID;

                      // Insert Lesson Pages
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
                      db.run(`INSERT INTO lessons (unit_id, title, content, duration_minutes) VALUES (?, ?, ?, ?)`,
                        [
                          unitId,
                          'Dignidad ng Tao Bilang Batayan ng Paggalang sa Sarili, Pamilya, at Kapuwa',
                          'Pag-unawa sa dignidad ng tao at ang batayan ng paggalang sa sarili at sa kapuwa.',
                          20
                        ],
                        function () {
                          const lesson2Id = this.lastID;

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
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );

  // Create sample users
  db.run(`INSERT INTO users (uid, displayName, email, role, class_id) VALUES (?, ?, ?, ?, ?)`,
    ['admin-uid-placeholder', 'Demo Admin', 'admin@gmail.com', 'admin', 'class-7a']);
  db.run(`INSERT INTO users (uid, displayName, email, role, class_id) VALUES (?, ?, ?, ?, ?)`,
    ['student1', 'Juan Dela Cruz', 'student1@demo.com', 'student', 'class-7a']);
  db.run(`INSERT INTO users (uid, displayName, email, role, class_id) VALUES (?, ?, ?, ?, ?)`,
    ['student2', 'Maria Santos', 'student2@demo.com', 'student', 'class-7a']);

  // Seed XP table
  db.run(`INSERT INTO xp (user_id, total_xp, current_level) VALUES (?, ?, ?)`, [1, 0, 1]);
  db.run(`INSERT INTO xp (user_id, total_xp, current_level) VALUES (?, ?, ?)`, [2, 50, 1]);
  db.run(`INSERT INTO xp (user_id, total_xp, current_level) VALUES (?, ?, ?)`, [3, 120, 2]);

  // Seed badges (same as before)
  const badges = [
    ['First Steps', 'Completed your first lesson', '🌱', 0, 'lessons_completed', 1, 'achievement'],
    ['Quiz Whiz', 'Scored 80% or higher on a quiz', '🧠', 0, 'quiz_score', 80, 'achievement'],
    ['Dedicated Learner', 'Completed 5 lessons', '📚', 0, 'lessons_completed', 5, 'milestone'],
    ['XP Collector', 'Earned 100 XP', '⭐', 0, 'xp', 100, 'milestone'],
    ['Week Warrior', 'Logged in for 7 consecutive days', '🔥', 0, 'streak', 7, 'special'],
    ['Perfect Score', 'Got 100% on a quiz', '💯', 0, 'quiz_score', 100, 'achievement'],
    ['Speed Learner', 'Completed a lesson in under 10 minutes', '⚡', 0, 'lessons_completed', 1, 'special']
  ];
  badges.forEach((badge) => {
    db.run(`INSERT INTO badges (name, description, icon, xp_required, condition_type, condition_value, badge_type) VALUES (?, ?, ?, ?, ?, ?, ?)`, badge);
  });

  // Award badges to demo users
  db.run(`INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)`, [2, 1]);
  db.run(`INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)`, [3, 1]);
  db.run(`INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)`, [3, 3]);

  console.log('🎉 Database seeded with real Lesson 1 content!');
});

setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
  });
}, 1000);

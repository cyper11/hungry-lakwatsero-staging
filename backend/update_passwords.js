const fs = require('fs');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

async function updatePasswords() {
  const hash = await bcrypt.hash('Admin@123!', 10);
  console.log('Generated new hash:', hash);

  const seedPath = './database/seed.sql';
  let seedContent = fs.readFileSync(seedPath, 'utf8');
  
  // The old broken hash was $2a$10$X4ufeGzAe06DViho8QI/Qu1mawrJBh4dG/kXX6CG6lGnK.Bcl1bzm
  const oldHash = '$2a$10$X4ufeGzAe06DViho8QI/Qu1mawrJBh4dG/kXX6CG6lGnK.Bcl1bzm';
  seedContent = seedContent.split(oldHash).join(hash);
  
  fs.writeFileSync(seedPath, seedContent);
  console.log('Updated seed.sql with correct hash.');

  const db = new sqlite3.Database('./database/eaty_wonders.sqlite');
  db.run('UPDATE users SET password_hash = ?', [hash], (err) => {
    if (err) console.error(err);
    else console.log('Updated SQLite database with correct hash.');
    db.close();
  });
}

updatePasswords();

const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'smartbotadmin',
  host: '127.0.0.1',
  database: 'smartbot_db',
  password: 'SmartBOT@Local123',
  port: 5433
});

async function resetPassword() {
  const email = 'sun8@gmail.com';
  const plainPassword = 'A12345';

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log('Hash length:', hashedPassword.length);

    const result = await pool.query(
      `UPDATE sb_user_det
       SET user_pw = $1,
           password_last_changed = CURRENT_TIMESTAMP
       WHERE LOWER(email_address) = LOWER($2)`,
      [hashedPassword, email]
    );

    console.log('Updated rows:', result.rowCount);

    const check = await pool.query(
      `SELECT user_pw
       FROM sb_user_det
       WHERE LOWER(email_address) = LOWER($1)`,
      [email]
    );

    const storedHash = check.rows[0]?.user_pw;
    console.log('Stored hash length:', storedHash?.length);
    console.log(
      'Password matches:',
      await bcrypt.compare(plainPassword, storedHash)
    );
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

resetPassword();
// init_db.js
const { Client } = require('pg');

async function main() {
  // Connect as OS user to default 'postgres' DB
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres', // default DB
    // user/password omitted -> uses OS user if allowed by pg_hba.conf
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL as OS user');

    const ADMIN_USER = 'smartbotadmin';
    const ADMIN_PASS = 'SmartBOT@Local123'; // choose your own strong password

    // 1) Ensure role smartbotadmin exists
    await client.query(`
      DO $do$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM pg_roles WHERE rolname = '${ADMIN_USER}'
        ) THEN
          CREATE ROLE ${ADMIN_USER}
            WITH LOGIN SUPERUSER CREATEDB CREATEROLE
            PASSWORD '${ADMIN_PASS}';
        END IF;
      END
      $do$;
    `);
    console.log('✅ Role smartbotadmin ensured');

    // 2) Check if database smartbot_db exists
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'smartbot_db'"
    );

    if (dbCheck.rowCount === 0) {
      console.log('ℹ️ Database smartbot_db does not exist, creating...');
      // IMPORTANT: CREATE DATABASE must be a top-level statement, not inside DO/transaction
      await client.query(
        `CREATE DATABASE smartbot_db OWNER ${ADMIN_USER}`
      );
      console.log('✅ Database smartbot_db created');
    } else {
      console.log('✅ Database smartbot_db already exists');
    }

    console.log('🎉 DB init completed');
  } catch (err) {
    console.error('❌ Error during init_db:', err);
  } finally {
    await client.end();
  }
}

main();

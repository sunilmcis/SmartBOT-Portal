// create_tables.js
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function main() {
  const client = new Client({
    user: 'smartbotadmin',
    host: 'localhost',
    database: 'smartbot_db',
    password: 'SmartBOT@Local123', // same as init_db.js
    port: 5432,
  });

  try {
    await client.connect();
    console.log("✅ Connected to smartbot_db");

    // Generate bcrypt hash for admin123
    const adminPasswordPlain = 'admin123';
    const adminHash = await bcrypt.hash(adminPasswordPlain, 10);
    console.log('🔐 Generated bcrypt hash for admin:', adminHash);

    // ---------- sb_user_det ----------
    await client.query(`DROP TABLE IF EXISTS sb_user_det CASCADE;`);

    await client.query(`
      CREATE TABLE sb_user_det (
        emp_id                SERIAL PRIMARY KEY,
        first_name            VARCHAR(100),
        last_name             VARCHAR(100),
        role                  VARCHAR(50),
        dept                  VARCHAR(50),
        email_address         VARCHAR(100) UNIQUE NOT NULL,
        phone_no              VARCHAR(50),
        user_pw               VARCHAR(255) NOT NULL,
        created_dt            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        profile_picture       VARCHAR(255),
        password_last_changed TIMESTAMP DEFAULT NOW(),
        v_access              VARCHAR(20),
        status                VARCHAR(20)
      );
    `);
    console.log("✅ sb_user_det table recreated");

    // ---------- sb_task_board ----------
    await client.query(`
      CREATE TABLE IF NOT EXISTS sb_task_board (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(255),
        description TEXT,
        status      VARCHAR(50), -- 'To Do', 'Hold', 'In Progress', 'Done'
        color       VARCHAR(20),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_dt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ sb_task_board table ensured");

    // ---------- sb_task_history ----------
    await client.query(`
      CREATE TABLE IF NOT EXISTS sb_task_history (
        id                   SERIAL PRIMARY KEY,
        task_id              INTEGER NOT NULL REFERENCES sb_task_board(id) ON DELETE CASCADE,
        previous_status      VARCHAR(50),
        new_status           VARCHAR(50),
        previous_title       TEXT,
        new_title            TEXT,
        previous_description TEXT,
        new_description      TEXT,
        previous_color       VARCHAR(20),
        new_color            VARCHAR(20),
        changed_by           VARCHAR(100),
        changed_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ sb_task_history table ensured");

    // ---------- sb_ba_tasks ----------
    await client.query(`
      CREATE TABLE IF NOT EXISTS sb_ba_tasks (
        id           SERIAL PRIMARY KEY,
        title        VARCHAR(255),
        description  TEXT,
        status_notes TEXT,
        attachment   VARCHAR(255),  -- stores file name if any
        status       VARCHAR(50),
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by   VARCHAR(100),
        assigned_to  VARCHAR(100),
        rfa_number   VARCHAR(50),
        due_date     DATE
      );
    `);
    console.log("✅ sb_ba_tasks table ensured");

    // ---------- sb_task_schedule ----------
    await client.query(`
      CREATE TABLE IF NOT EXISTS sb_task_schedule (
        id          SERIAL PRIMARY KEY,
        title       TEXT NOT NULL,
        description TEXT,
        assigned_to TEXT,
        status      TEXT DEFAULT 'Pending',
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ sb_task_schedule table ensured");

  // ---------- sb_resignation_requests ----------
    await client.query(`
  CREATE TABLE IF NOT EXISTS sb_resignation_requests (
    id               SERIAL PRIMARY KEY,
    employee_id      INTEGER NOT NULL REFERENCES sb_user_det(emp_id),
    manager_id       INTEGER REFERENCES sb_user_det(emp_id),
    hr_id            INTEGER REFERENCES sb_user_det(emp_id),

    reason           TEXT NOT NULL,
    comments_employee TEXT,
    comments_manager  TEXT,
    comments_hr       TEXT,

    requested_last_day DATE,        -- optional (employee suggestion)
    approved_last_day  DATE,        -- final date set by HR

    status           VARCHAR(30) NOT NULL,
    -- values you will use:
    -- 'SUBMITTED', 'MANAGER_APPROVED', 'MANAGER_REJECTED',
    -- 'HR_APPROVED', 'HR_REJECTED', 'CANCELLED'

    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

 `);

 // ---------- sb_resignation_history ----------
 await client.query(`

    CREATE TABLE IF NOT EXISTS sb_resignation_history (
      id             SERIAL PRIMARY KEY,
      request_id     INTEGER NOT NULL REFERENCES sb_resignation_requests(id) ON DELETE CASCADE,
      action_by_id   INTEGER NOT NULL REFERENCES sb_user_det(emp_id),
      action_by_role VARCHAR(30),          -- 'EMPLOYEE','MANAGER','HR'
      old_status     VARCHAR(30),
      new_status     VARCHAR(30),
      action_note    TEXT,
      created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

`);


    // ---------- Default admin user ----------
    await client.query(
      `INSERT INTO sb_user_det
         (first_name, last_name, role, dept, email_address, phone_no, user_pw)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'Admin',
        'User',
        'admin',
        'IT',
        'admin@mcis.com',
        '0123456789',
        adminHash         // bcrypt hash for 'admin123'
      ]
    );
    console.log("🔐 Default admin user created (email: admin@mcis.com, password: admin123)");

    console.log("🎉 All tables created successfully.");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  } finally {
    await client.end();
  }
}

main();

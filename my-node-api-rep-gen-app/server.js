const express = require('express');
const oracledb = require('oracledb');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const { PythonShell } = require('python-shell');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const port = 3017;

// ✅ Python setup
const pythonPath = 'C:\\Users\\sunil.p\\AppData\\Local\\Programs\\Python\\Python37\\python.exe';
const scriptsDir = 'C:\\temp\\qc';
const scriptsDirPDF = 'C:\\temp\\Pdf_Encryption-Claim';
const processedFolder = 'C:\\temp\\Pdf-Claim\\test1\\Processed';
const targetPdfFolder = 'C:\\temp\\Pdf-Claim\\test1';

// ✅ Middlewares
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ OracleDB connection
const dbConfig = {
  user: 'MZISF',
  password: 'ORACLE438',
  connectString: '10.151.2.153:1521/LOD'
};

// ✅ PostgreSQL connection
//const pool = new Pool({
//  user: 'postgres',
//  host: 'localhost',
//  database: 'smartbot_db',
//  password: 'SmartBOT@123',
//  port: 5432,
//});

const pool = new Pool({
  user: 'smartbotadmin',          // ✅ use the role we created
  host: 'localhost',
  database: 'smartbot_db',        // ✅ DB created by init_db.js
  password: 'SmartBOT@Local123',  // ✅ same password as in init_db.js
  port: 5433, // 5422
});


// ✅ Profile Picture Upload Setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: uploadStorage });

// ✅ Login API
app.post('/api/login', async (req, res) => {
  console.log('🟢 Login body:', req.body);
  const { username, password } = req.body;
  const PASSWORD_EXPIRY_DAYS = 90;


  try {
    const result = await pool.query(`SELECT * FROM sb_user_det WHERE email_address = $1`, [username]);
      console.log('📥 Query rows length:', result.rows.length);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid username or password' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.user_pw);
    if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' });

    //added to check password expiry date
    const lastChanged = new Date(user.password_last_changed);
    const now = new Date();
    const diffDays = Math.floor((now - lastChanged) / (1000 * 60 * 60 * 24));
    const needsPasswordReset = diffDays >= PASSWORD_EXPIRY_DAYS;
    //End of added to check password expiry date

    res.json({
      success: true,
      user: {
        username: user.first_name,
        email: user.email_address,
        role: user.role,
        profilePicture: user.profile_picture ? `http://localhost:${port}/uploads/${user.profile_picture}` : null,
        needsPasswordReset: needsPasswordReset
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Registration API
/*
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, role, department, email, phoneNumber, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO sb_user_det (first_name, last_name, role, dept, email_address, phone_no, user_pw,password_last_changed )
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING emp_id`,
      [firstName, lastName, role, department, email, phoneNumber, hashedPassword]
    );
    res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].emp_id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error registering user' });
  }
});
*/
app.post('/api/register', async (req, res) => {
  const {
    firstName,
    lastName,
    role,
    department,
    email,
    phoneNumber,
    password
  } = req.body;

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      `SELECT emp_id
       FROM sb_user_det
       WHERE LOWER(email_address) = $1`,
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'Email address is already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const prefix = firstName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 3);

    const randomNumber = Math.floor(100000 + Math.random() * 900000);

    const empId = `${prefix}${randomNumber}`;

    const result = await pool.query(
      `INSERT INTO sb_user_det
       (
         emp_id,
         first_name,
         last_name,
         role,
         dept,
         email_address,
         phone_no,
         user_pw,
         password_last_changed
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING emp_id`,
      [
        empId,
        firstName.trim(),
        lastName.trim(),
        role.trim(),
        department.trim(),
        normalizedEmail,
        phoneNumber.trim(),
        hashedPassword
      ]
    );

    return res.status(201).json({
      message: 'User registered successfully',
      userId: result.rows[0].emp_id
    });

  } catch (err) {
    console.error('Registration error:', err);

    return res.status(500).json({
      message: 'Error registering user',
      error: err.message
    });
  }
});
// ✅ Upload Profile Picture (filename stored in DB)
//app.post('/api/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
//  const { username } = req.body;
//  const file = req.file;
//  if (!username || !file) return res.status(400).send('Missing data');
//
//  await pool.query(`UPDATE sb_user_det SET profile_picture = $1 WHERE first_name = $2`, [file.filename, username]);
//
//  res.json({ message: 'Profile uploaded successfully', fileUrl: `http://localhost:${port}/uploads/${file.filename}` });
//});

//const path = require('path'); //commented for performance issue

// ✅ Upload Profile Picture (filename stored in DB)
app.post('/api/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  const t0 = Date.now();

  try {
    const { username } = req.body;
    const file = req.file;

    if (!username || !file) {
      return res.status(400).json({ error: 'Missing file or username' });
    }

    const t1 = Date.now();
    console.log(`📥 File received: ${file.originalname}, size: ${file.size} bytes`);
    console.log(`👤 Username received: ${username}`);
    console.log(`⏱️ Multer save time: ${(t1 - t0)} ms`);

    const t2 = Date.now();
    const updateQuery = `UPDATE sb_user_det SET profile_picture = $1 WHERE first_name = $2`;
    await pool.query(updateQuery, [file.filename, username]);
    const t3 = Date.now();

    const fileUrl = `http://localhost:${port}/uploads/${file.filename}`;
    res.json({ message: 'Profile uploaded successfully', fileUrl });

    const t4 = Date.now();
    console.log(`📄 PostgreSQL update time: ${(t3 - t2)} ms`);
    console.log(`🚀 Total backend upload time: ${(t4 - t0)} ms`);
  } catch (err) {
    console.error('❌ Error uploading profile picture:', err);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});



// ✅ Get Profile Picture (returns file URL)
//app.get('/api/user/:username/profile-picture', async (req, res) => {
//  const { username } = req.params;
//  const result = await pool.query(`SELECT profile_picture FROM sb_user_det WHERE first_name = $1`, [username]);
//  if (result.rows.length === 0 || !result.rows[0].profile_picture) return res.status(404).send('No profile image found');
//
//  const fileUrl = `http://localhost:${port}/uploads/${result.rows[0].profile_picture}`;
//  //res.json({ imageUrl: fileUrl });
//  res.json({
//    success: true,
//    user: {
//      username: user.first_name,
//      email: user.email_address,
//      role: user.role,
//      profilePicture: user.profile_picture || null
//    }
//  });
//
//});

// ✅ Get Profile Picture + Basic Info
app.get('/api/user/:username/profile-picture', async (req, res) => {
  const t0 = Date.now();
  try {
    const { username } = req.params;
    const query = `SELECT first_name, email_address, role,dept, profile_picture FROM sb_user_det WHERE first_name = $1`;
    const result = await pool.query(query, [username]);
    const t1 = Date.now();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const fileUrl = user.profile_picture
      ? `http://localhost:${port}/uploads/${user.profile_picture}`
      : null;

    res.json({
      success: true,
      user: {
        username: user.first_name,
        email: user.email_address,
        role: user.role,
        profilePicture: fileUrl,
      },
    });

    const t2 = Date.now();
    console.log(`🔍 PostgreSQL fetch time: ${(t1 - t0)} ms`);
    console.log(`🚀 Total fetch time: ${(t2 - t0)} ms`);
  } catch (err) {
    console.error('❌ Error fetching profile picture:', err);
    res.status(500).json({ error: 'Failed to retrieve profile picture' });
  }
});



// ✅ fetch data from Oracle
//app.get('/api/first-table', async (req, res) => {
//  try {
//
//
//    const conn = await oracledb.getConnection(dbConfig);
//    const result = await conn.execute(`SELECT DISTINCT V_REPORT_ID FROM AUT_REPORT_DETAIL`);
//    await conn.close();
//    res.json(result.rows);
//  } catch (err) {
//    console.error('Oracle error:', err);
//    res.status(500).send('Oracle DB Error');
//  }
//});
// ✅ fetch data from postgresql
app.get('/api/first-table', async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT v_report_id FROM AUT_REPORT_MASTER`);
    console.log('api result :', result);
    res.json(result.rows); // PostgreSQL returns .rows directly
  } catch (err) {
    console.error('PostgreSQL error:', err);
    res.status(500).send('PostgreSQL Error');
  }
});

// ✅ fetch data from Oracle
//app.get('/api/second-table', async (req, res) => {
//  const { reportId } = req.query;
//  if (!reportId) return res.status(400).send('Missing reportId');
//  try {
//    const conn = await oracledb.getConnection(dbConfig);
//    const result = await conn.execute(`SELECT * FROM AUT_REPORT_DETAIL WHERE V_REPORT_ID = :id`, [reportId]);
//    await conn.close();
//    res.json(result.rows);
//  } catch (err) {
//    console.error('Oracle error:', err);
//    res.status(500).send('Oracle DB Error');
//  }
//});
// ✅ fetch data from postgresql
app.get('/api/second-table', async (req, res) => {
  const { reportId } = req.query;
  if (!reportId) return res.status(400).send('Missing reportId');

  try {
    const result = await pool.query(
      `SELECT v_report_id FROM AUT_REPORT_PARAM WHERE v_report_id = $1`,
      [reportId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('PostgreSQL error:', err);
    res.status(500).send('PostgreSQL Error');
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sb_user_det ORDER BY created_dt DESC');
    res.json({
      users: result.rows,
      total: result.rows.length
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});





app.put('/api/users/:id/access', async (req, res) => {
  const { id } = req.params;
  const { access } = req.body;

  console.log('*** ID:', id);
  console.log('*** Access:', access);

  if (!id || !access) {
  console.log('*** error triggering:', id);
       return res.status(400).json({ error: 'Missing ID or access value' });
  }


  //await pool.query('UPDATE sb_user_det SET v_access = $1 WHERE emp_id = $2', [access, id]);
  await pool.query('UPDATE sb_user_det SET v_access = $1 WHERE emp_id = $2', [access, parseInt(id)]);

  //res.sendStatus(200);
  res.status(200).json({ message: 'Access updated' });

});



app.post('/api/save-note', async (req, res) => {
  const { noteContent, reportId } = req.body;
  if (!noteContent) return res.status(400).send('Note content required');
  try {
    const conn = await oracledb.getConnection(dbConfig);
    const seq = await conn.execute(`SELECT SEQ_AUT_REP_GEN.NEXTVAL AS NEXTVAL FROM dual`);
    const nextVal = 'AUTREP' + seq.rows[0].NEXTVAL;
    await conn.execute(
      `INSERT INTO AUTO_REPORT_GEN_MSTR (N_AUT_REP_GEN_SEQ, V_REPORT_ID, C_JSON_DATA, D_DATE_REQUESTED, STATUS)
       VALUES (:nextVal, :reportId, :noteContent, SYSDATE, 'P')`,
      { nextVal, reportId, noteContent },
      { autoCommit: true }
    );
    await conn.close();
    res.json({ message: 'Note saved successfully' });
  } catch (err) {
    console.error('Save note error:', err);
    res.status(500).send('Save Note Error');
  }
});

// ✅ Python Execution APIs
app.get('/api/run-python', (req, res) => {
  const script = path.join(scriptsDir, 'qc.py');
  const shell = new PythonShell(script, { pythonPath });
  const output = [];
  shell.on('message', msg => output.push(msg));
  shell.end(err => err ? res.status(500).send(err.message) : res.json({ output }));
});

app.get('/api/run-python-PDF', (req, res) => {
  const script = path.join(scriptsDirPDF, 'pdf_encrypt.py');
  const shell = new PythonShell(script, { pythonPath });
  const output = [];
  shell.on('message', msg => output.push(msg));
  shell.end(err => err ? res.status(500).send(err.message) : res.json({ output }));
});

app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Missing email or new password' });
  }
   console.log('resetting pw $1');
   console.log('resetting pw $2');
  try {
    // Optionally hash password with bcrypt (recommended)
    // const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(

      'UPDATE sb_user_det SET user_pw = $1 WHERE email_address = $2',
      [newPassword, email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//Added for Testing

// PostgreSQL Table: task_schedule
 //Columns: id, title, description, assigned_to, status, created_at, updated_at

app.get('/api/tasks', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      `SELECT id AS task_id, title, description, status_notes, attachment, status,
              created_at, updated_at, created_by AS creator, assigned_to AS assignee,
              rfa_number, due_date AS target_completion_date
       FROM sb_ba_tasks
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`, [limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM sb_ba_tasks');
    const total = parseInt(countResult.rows[0].count);

    res.json({ tasks: result.rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// API to create task with optional file
app.post('/api/tasks', upload.single('attachment'), async (req, res) => {
  const { title, description, status_notes, status, created_by, assigned_to, rfa_number, due_date } = req.body;
  const attachment = req.file ? req.file.filename : null;

  try {
    await pool.query(
      `INSERT INTO sb_ba_tasks (title, description, status_notes, attachment, status, created_by, assigned_to, rfa_number, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [title, description, status_notes, attachment, status, created_by, assigned_to, rfa_number, due_date]
    );
    res.status(201).send('Task created');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create task');
  }
});



//// GET /api/tasks?page=1&limit=15
//router.get('/tasks', async (req, res) => {
//  const page = parseInt(req.query.page) || 1;
//  const limit = parseInt(req.query.limit) || 15;
//  const offset = (page - 1) * limit;
//
//  try {
//    const result = await pool.query(
//      `SELECT id AS task_id, title, description, status_notes, attachment, status,
//              created_at, updated_at, created_by AS creator, assigned_to AS assignee,
//              rfa_number, due_date AS target_completion_date
//       FROM tasks
//       ORDER BY created_at DESC
//       LIMIT $1 OFFSET $2`, [limit, offset]
//    );
//    res.json(result.rows);
//  } catch (err) {
//    console.error(err);
//    res.status(500).send('Server error');
//  }
//});


app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await pool.query('UPDATE sb_ba_tasks SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
  res.sendStatus(200);
});

//get all tasks from task_board
//app.get('/api/tasks-board', async (req, res) => {
//  const result = await pool.query('SELECT * FROM task_board ORDER BY id');
//  res.json(result.rows);
//});

app.get('/api/tasks-board', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM task_board ORDER BY id');
    res.json(result.rows); // ✅ Must be array
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json([]);
  }
});


// Create task
app.post('/api/ins-tasks-board', async (req, res) => {
  const { title, description, status } = req.body;
  const result = await pool.query(
    'INSERT INTO task_board (title, description, status) VALUES ($1, $2, $3) RETURNING *',
    [title, description, status]
  );
  res.json(result.rows[0]);
});

// Update task status
// Update task (status, color, title, description, etc.)
app.put('/api/tasks-board/:id', async (req, res) => {
  const { id } = req.params;
  const { status, title, description, color, updated_by } = req.body;
  console.log('id ',id);
  console.log('status ',status);
  console.log('title ',title);
  console.log('description ',description);
  console.log('color ',color);
  try {
    const result = await pool.query(
      `UPDATE task_board
       SET status = COALESCE($1, status),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           color = COALESCE($4, color),
           updated_dt = NOW()
       WHERE id = $5`,
      [status, title, description, color, id]
    );

        // Insert task_history
        await pool.query(
          `INSERT INTO task_history (
            task_id,
            previous_status, new_status,
            previous_title, new_title,
            previous_description, new_description,
            previous_color, new_color,
            changed_by
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            id,
            oldTask.status, status,
            oldTask.title, title,
            oldTask.description, description,
            oldTask.color, color,
            updated_by || 'unknown'
          ]
        );

    res.json({ message: 'Task updated and history recorded successfully' });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Update failed' });
  }
});

app.get('/api/tasks-board/history/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    const result = await pgPool.query(
      `SELECT * FROM task_history WHERE task_id = $1 ORDER BY updated_at DESC`,
      [taskId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching task history:', err);
    res.status(500).json({ error: 'Failed to fetch task history' });
  }
});

// ==========================================
// RESIGNATION WORKFLOW APIs
// ==========================================

// Helper – insert history record
async function addResignationHistory(requestId, actionById, role, oldStatus, newStatus, note) {
  await pool.query(
    `INSERT INTO sb_resignation_history
       (request_id, action_by_id, action_by_role, old_status, new_status, action_note)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [requestId, actionById, role, oldStatus, newStatus, note || null]
  );
}

// POST /api/resignations
app.post('/api/resignations', async (req, res) => {
  const { employeeId, managerId, reason, requestedLastDay, commentsEmployee } = req.body;

   if (!employeeId || !managerId || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

  try {
    const result = await pool.query(
      `INSERT INTO sb_resignation_requests
        (employee_id, manager_id, reason, requested_last_day, comments_employee, status)
       VALUES ($1, $2, $3, $4, $5, 'SUBMITTED')
       RETURNING id, status, created_at`,
      [employeeId, managerId, reason, requestedLastDay || null, commentsEmployee || null]
    );

    const requestId = result.rows[0].id;

    await pool.query(
      `INSERT INTO sb_resignation_history
        (request_id, action_by_id, action_by_role, old_status, new_status, action_note)
       VALUES ($1, $2, 'EMPLOYEE', NULL, 'SUBMITTED', $3)`,
      [requestId, employeeId, commentsEmployee || 'Submitted resignation']
    );

    res.status(201).json({ success: true, requestId });
  } catch (err) {
    console.error('Create resignation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//Manager view + approve / reject
// GET /api/resignations/manager/:managerId/pending
app.get('/api/resignations/manager/:managerId/pending', async (req, res) => {
  const { managerId } = req.params;
  try {
    const result = await pool.query(
      `SELECT r.*, u.first_name AS employee_name
       FROM sb_resignation_requests r
       JOIN sb_user_det u ON r.employee_id = u.emp_id
       WHERE r.manager_id = $1 AND r.status = 'SUBMITTED'
       ORDER BY r.created_at DESC`,
      [managerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Manager pending error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/resignations/:id/manager
app.put('/api/resignations/:id/manager', async (req, res) => {
  const { id } = req.params;
  const { managerId, approved, commentsManager } = req.body;
  const newStatus = approved ? 'MANAGER_APPROVED' : 'MANAGER_REJECTED';

  try {
    const update = await pool.query(
      `UPDATE sb_resignation_requests
       SET status = $1,
           comments_manager = $2,
           updated_at = NOW()
       WHERE id = $3 AND manager_id = $4
       RETURNING employee_id, status`,
      [newStatus, commentsManager || null, id, managerId]
    );

    if (update.rowCount === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await pool.query(
      `INSERT INTO sb_resignation_history
        (request_id, action_by_id, action_by_role, old_status, new_status, action_note)
       VALUES ($1, $2, 'MANAGER', 'SUBMITTED', $3, $4)`,
      [id, managerId, newStatus, commentsManager || null]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Manager decision error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//HR view + final approval + last working day

 // GET /api/resignations/hr/pending
 app.get('/api/resignations/hr/pending', async (req, res) => {
   try {
     const result = await pool.query(
       `SELECT r.*, u.first_name AS employee_name, m.first_name AS manager_name
        FROM sb_resignation_requests r
        JOIN sb_user_det u ON r.employee_id = u.emp_id
        LEFT JOIN sb_user_det m ON r.manager_id = m.emp_id
        WHERE r.status = 'MANAGER_APPROVED'
        ORDER BY r.created_at DESC`
     );
     res.json(result.rows);
   } catch (err) {
     console.error('HR pending error:', err);
     res.status(500).json({ message: 'Server error' });
   }
 });

 // PUT /api/resignations/:id/hr
 app.put('/api/resignations/:id/hr', async (req, res) => {
   const { id } = req.params;
   const { hrId, approved, commentsHr, approvedLastDay } = req.body;
   const newStatus = approved ? 'HR_APPROVED' : 'HR_REJECTED';

   try {
     const update = await pool.query(
       `UPDATE sb_resignation_requests
        SET status = $1,
            comments_hr = $2,
            approved_last_day = $3,
            hr_id = $4,
            updated_at = NOW()
        WHERE id = $5
        RETURNING employee_id`,
       [newStatus, commentsHr || null, approved ? approvedLastDay : null, hrId, id]
     );

     if (update.rowCount === 0) {
       return res.status(404).json({ message: 'Request not found' });
     }

     await pool.query(
       `INSERT INTO sb_resignation_history
         (request_id, action_by_id, action_by_role, old_status, new_status, action_note)
        VALUES ($1, $2, 'HR', 'MANAGER_APPROVED', $3, $4)`,
       [id, hrId, newStatus, commentsHr || null]
     );

     // here you can trigger email to employee + manager using your Outlook/SMTP util

     res.json({ success: true });
   } catch (err) {
     console.error('HR decision error:', err);
     res.status(500).json({ message: 'Server error' });
   }
 });


//Employee view of their requests

// GET /api/resignations/employee/:empId
app.get('/api/resignations/employee/:empId', async (req, res) => {
  const { empId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM sb_resignation_requests
       WHERE employee_id = $1
       ORDER BY created_at DESC`,
      [empId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Employee resignations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// End of added for Testing


// ✅ Serve Angular App
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`));

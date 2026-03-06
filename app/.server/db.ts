import mysql from "mysql2/promise";

let pool: mysql.Pool;

export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "Indonesia77",
      database: process.env.DB_NAME || "army_qrcode",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function initDb() {
  const db = getDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') DEFAULT 'user',
      avatar VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS themes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      primary_color VARCHAR(7) DEFAULT '#DC2626',
      legal_info TEXT,
      welcome_screen_time INT DEFAULT 5,
      welcome_image LONGTEXT,
      user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS qrcodes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      name VARCHAR(100),
      surname VARCHAR(100),
      title VARCHAR(100),
      email VARCHAR(100),
      profile_image LONGTEXT,
      social_network VARCHAR(255),
      theme_id INT,
      status ENUM('draft', 'published') DEFAULT 'draft',
      scans INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS qrcode_phones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      qrcode_id INT NOT NULL,
      phone VARCHAR(30),
      FOREIGN KEY (qrcode_id) REFERENCES qrcodes(id) ON DELETE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      title VARCHAR(200),
      message TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  const [users]: any = await db.query("SELECT COUNT(*) as count FROM users");
  if (users[0].count === 0) {
    const bcrypt = await import("bcryptjs");
    const hash = bcrypt.hashSync("admin123", 10);
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["Admin", "admin@armysecurity.com", hash, "admin"],
    );

    await db.query(
      "INSERT INTO themes (name, primary_color, legal_info, user_id) VALUES (?, ?, ?, ?)",
      ["ARMY", "#DC2626", "© 2024 Army Security. All Rights Reserved.", 1],
    );
    await db.query(
      "INSERT INTO themes (name, primary_color, legal_info, user_id) VALUES (?, ?, ?, ?)",
      ["RPQ", "#2563EB", "© 2024 RPQ Corp. All Rights Reserved.", 1],
    );

    await db.query(
      `INSERT INTO qrcodes (user_id, name, surname, title, email, social_network, theme_id, status, scans)
       VALUES (1, 'John', 'Doe', 'Business Development', 'john@armysecurity.com', 'armysecurityguard.com', 1, 'published', 124)`,
    );
    await db.query(
      "INSERT INTO qrcode_phones (qrcode_id, phone) VALUES (1, '081902102020')",
    );

    await db.query(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (1, 'Welcome!', 'Welcome to ArmyQR Code Management System.', 'success')",
    );
  }

  console.log("✅ Database initialized");
}

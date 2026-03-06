import { getDb } from "~/.server/db";

/**
 * Get all QR codes for a user
 */
export async function getUserQRCode(user_id: number) {
  const db = getDb();
  const [qrcodes] = await db.query(
    `SELECT q.*, t.name as theme_name, t.primary_color
     FROM qrcodes q
     LEFT JOIN themes t ON q.theme_id = t.id
     WHERE q.user_id = ?
     ORDER BY q.created_at DESC`,
    [user_id]
  );
  
  return qrcodes as any[];
}

/**
 * Get a single QR code by ID
 */
export async function getQRCodeById(id: number, user_id: number) {
  const db = getDb();
  const [qrcodes] = await db.query(
    `SELECT q.*, t.name as theme_name, t.primary_color, t.legal_info
     FROM qrcodes q
     LEFT JOIN themes t ON q.theme_id = t.id
     WHERE q.id = ? AND q.user_id = ?`,
    [id, user_id]
  );
  
  if (qrcodes.length === 0) {
    return null;
  }
  
  const qrCode = qrcodes[0];
  
  // Get associated phones
  const [phones] = await db.query(
    "SELECT * FROM qrcode_phones WHERE qrcode_id = ?",
    [qrCode.id]
  );
  
  return {
    ...qrCode,
    phones
  };
}

/**
 * Delete a QR code by ID
 */
export async function deleteQRCodeById(id: number, user_id: number) {
  const db = getDb();
  await db.query(
    "DELETE FROM qrcodes WHERE id = ? AND user_id = ?",
    [id, user_id]
  );
}
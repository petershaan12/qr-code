import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique ID for QR codes
 */
export function generateUniqueId(): string {
  return uuidv4().substring(0, 8); // Use first 8 characters of UUID
}

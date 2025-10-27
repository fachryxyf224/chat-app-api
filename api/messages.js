// api/messages.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Set CORS agar hanya bisa diakses dari GitHub Pages kamu
  const allowedOrigin = 'https://fachryxyf224.github.io/chat-web/';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT username, text, media_url, media_type, created_at FROM messages ORDER BY created_at ASC');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  } else if (req.method === 'POST') {
    const { username, text, mediaUrl, mediaType } = req.body;
    if (!username || (!text && !mediaUrl)) {
      return res.status(400).json({ error: 'Username and either text or media are required' });
    }
    try {
      const query = 'INSERT INTO messages (username, text, media_url, media_type) VALUES ($1, $2, $3, $4) RETURNING *';
      const values = [username, text, mediaUrl, mediaType];
      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
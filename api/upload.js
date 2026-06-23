// api/upload.js
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // disable Next.js body parsing (Vercel uses same)
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm({
    multiples: false,
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    uploadDir: path.join(process.cwd(), 'public', 'uploads'),
    keepExtensions: true,
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Move file to final destination (already saved in uploadDir)
    const filePath = file.filepath;
    const fileUrl = `/uploads/${path.basename(filePath)}`;

    // Respond with file metadata
    return res.status(200).json({
      message: 'Upload successful',
      file: {
        name: file.originalFilename,
        size: file.size,
        type: file.mimetype,
        url: fileUrl,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}

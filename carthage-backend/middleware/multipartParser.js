const busboy = require('busboy');

module.exports = (req, res, next) => {
  if (req.method !== 'POST') return next();

  const bb = busboy({ headers: req.headers });
  const files = [];
  let mimeType = null;

  bb.on('file', (fieldname, file, info) => {
    mimeType = info.mimeType;
    const chunks = [];
    file.on('data', (data) => chunks.push(data));
    file.on('end', () => {
      const buffer = Buffer.concat(chunks);
      files.push({ fieldname, buffer, mimetype: mimeType });
    });
  });

  bb.on('finish', () => {
    if (files.length) {
      req.files = files;
    }
    next();
  });

  bb.on('error', (err) => {
    console.error('Busboy error:', err);
    res.status(500).json({ message: 'File parsing error', error: err.message });
  });

  req.pipe(bb);
};

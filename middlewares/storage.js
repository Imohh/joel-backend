const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// const storage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, 'public/images/');
//   },
//   filename(req, file, cb) {
//     cb(null, `${Date.now()}.jpg`);
//   },
// });

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;

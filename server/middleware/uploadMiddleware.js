const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, '..', 'uploads', 'profile-images');
    
    if (file.fieldname === 'resume') {
      uploadPath = path.join(__dirname, '..', 'uploads', 'resumes');
    } else if (file.fieldname === 'document') {
      uploadPath = path.join(__dirname, '..', 'uploads', 'payslips');
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx/;
  
  const extname = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (file.fieldname === 'avatar' || file.fieldname === 'photo') {
    if (allowedImageTypes.test(extname)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
    }
  } else {
    if (allowedImageTypes.test(extname) || allowedDocTypes.test(extname)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;

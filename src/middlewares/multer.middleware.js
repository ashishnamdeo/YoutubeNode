import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp" )
  },
  filename: function (req, file, cb) {// cb is callback like ${name}
    // we can add suffix
    cb(null, file.originalname)
  }
})
export const upload = multer({ storage: storage })

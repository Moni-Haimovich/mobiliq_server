const AWS = require("aws-sdk");
const { v4: uuid } = require("uuid");
const multer = require("multer");
const multerS3 = require("multer-s3");

const AWS_ID = process.env.AWS_ID;
const AWS_KEY = process.env.AWS_KEY;
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const s3 = new AWS.S3({
  accessKeyId: AWS_ID,
  secretAccessKey: AWS_KEY,
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const { mimetype } = file;
  const isImg = filetypes.test(mimetype);

  if (isImg) {
    cb(null, true);
    return;
  }

  cb(new Error("Only Images are allowed."));
};

const uploadS3 = multer({
  fileFilter,
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const { originalname } = file;
      cb(null, `${uuid()}_${originalname}`);
    },
  }),
});

const removeImg = (url) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject({ Bucket: BUCKET_NAME, Key: url }, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

module.exports = { uploadS3, removeImg };

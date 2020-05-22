const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

const storageTypes = {
    local: multer.diskStorage({
        destination: (req,file,cb) => {
            cb(null, path.resolve(__dirname, '..','..','temp','uploads'));
        },
        filename: (req, file,cb) => {
            crypto.randomBytes(16, (err,hash) => {
                if(err) cb(err);
                file.key = `${hash.toString('hex')}-${file.originalname}`;
                cb(null, file.key);
            });
        }
    }),
    s3: multerS3({
        s3: new aws.S3(),
        bucket: 'uploadimagesbackend',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req,file,cb) => {
            crypto.randomBytes(16, (err,hash) => {
                if(err) cb(err);
                const filename = `${hash.toString('hex')}-${file.originalname}`;
                cb(null,filename);
            });
        },
    })
}

module.exports  = {
    dest: path.resolve(__dirname, '..','..','temp','uploads'), //responsavel por salvar em determinado diretório local
    storage: storageTypes["s3"],
    limits: {
        fileSize: 2*1024*1024
    },
    fileFilter: (req,file,cb) => {
        const allowedMimes = [
            "image/jpeg",
            "image/pjepg",
            "image/ong",
            "image/gif"
        ];

        if(allowedMimes.includes(file.mimetype)){
            cb(null,true);
        }else{
            cb(new Error("Invalid file type"));
        }
    }
};
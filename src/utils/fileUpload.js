const multer = require('multer');
const mime = require('mime');

const { generateNumber } = require('./random');
const appConfig = require('../../configs/app.config');
const serializeHttpResponse = require('../helpers/serialize-http-response');

const storage = multer.diskStorage({
    destination: appConfig.fileUploadPath,
    filename: (req, file, cb) => {
        const ext = mime.getExtension(file.mimetype);
        cb(null, `file_${Date.now()}_${generateNumber(2)}.${ext}`);
    }
});

const upload = multer({ storage });

exports.uploadFamelinksMedia = (req, res, next) => {
    upload.fields([{
        name: 'closeUp',
        maxCount: 1
    },{
        name: 'medium',
        maxCount: 1
    },{
        name: 'long',
        maxCount: 1
    },{
        name: 'pose1',
        maxCount: 1
    },{
        name: 'pose2',
        maxCount: 1
    },{
        name: 'additional',
        maxCount: 1
    },{
        name: 'video',
        maxCount: 1
    }])(req, res, (err) => {
        if (err) {
            return next(serializeHttpResponse(500, {
                message: 'Server Error',
                error: err.message
            }));
        }

        if (req.files) {
            Object.keys(req.files).forEach(item => {
                if (req.files[item] && req.files[item][0]) {
                    req.files[item] = req.files[item][0].filename;
                }
            });
        }

        try {
            if (req.body.challengeId) {
                req.body.challengeId = JSON.parse(req.body.challengeId);
            }
        } catch (error) {
            next(serializeHttpResponse(400, {
                message: 'Invalid Challenge List',
                error: err.message
            }));
        }

        return next();
    });
};

exports.uploadFunlinkMedia = (req, res, next) => {
    upload.fields([{
        name: 'funlink',
        maxCount: 1
    }])(req, res, (err) => {
        if (err) {
            return serializeHttpResponse(500, {
                message: 'Server Error',
                error: err.message
            });
        }
        if (req.files.funlink && req.files.funlink[0]) {
            req.files.funlink = req.files.funlink[0].filename;
        }
        return next();
    });
};

exports.uploadProfileImage = (req, res, next) => {
    upload.fields([{
        name: 'profileImage',
        maxCount: 1
    }])(req, res, (err) => {
        if (err) {
            return serializeHttpResponse(500, {
                message: 'Server Error',
                error: err.message
            });
        }
        if (req.files && req.files.profileImage && req.files.profileImage[0]) {
            req.files.profileImage = req.files.profileImage[0].filename;
        }
        return next();
    });
};
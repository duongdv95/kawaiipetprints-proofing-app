const aws              = require("aws-sdk")
const multer           = require("multer")
const multerS3         = require("multer-s3")
const awsconfig        = require("./awsconfig")
aws.config.update(awsconfig)

const s3 = new aws.S3();
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(new Error('Invalid Mime Type, only JPEG and PNG'), false);
    }
}

const upload = multer({
    fileFilter,
    storage: multerS3({
        s3,
        bucket: 'kawaiipetprints-assets',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: 'TESTING_META_DATA!' });
        },
        key: function (req, file, cb) {
            cb(null, `order_number=${req.body.order_number}&order_id=${req.body.order_id}&variant_id=${req.body.variant_id}&date=${Date.now().toString()}.png`)
        }
    })
})

const deleteImages = async ({ key }) => {
    var params = {
        Bucket: 'kawaiipetprints-assets',
        Key: `${key}`
    }
    await s3.deleteObject(params, function (err, data) {
        if(!err) {
            console.log(data)
        } else {
            console.log(err);
        }
    })
}

module.exports = {
    upload,
    deleteImages
}
const path = require('path')
const crypto = require('crypto')
const multer = require('multer')

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp')

module.exports = {
  driver: 's3',

  tmpFolder,
  uploadsFolder: path.resolve(tmpFolder, 'uploads'),

  multer: {
    storage: multer.diskStorage({
      destination: tmpFolder,
      filename(request, file, callback) {
        const fileHash = crypto.randomBytes(10).toString('hex')
        const fileName = `${fileHash}-${file.originalname}`

        return callback(null, fileName)
      },
    }),
  },

  config: {
    disk: {},
    aws: {
      bucket: 'euvoluntario',
    },
  },
}

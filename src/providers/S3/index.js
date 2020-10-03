const fs = require('fs')
const path = require('path')
const mime = require('mime')
const aws = require('aws-sdk')
const uploadConfig = require('../../config/upload')

const client = new aws.S3({
  region: 'us-east-1',
})

module.exports = {
  async saveFile(file, destinyFolder) {
    const originalPath = path.resolve(uploadConfig.tmpFolder, file)

    const ContentType = mime.getType(originalPath)

    if (!ContentType)
      return res.status(400).send({ error: 'Arquivo não encontrado' })

    const fileContent = await fs.promises.readFile(originalPath)

    await client
      .putObject({
        Bucket: uploadConfig.config.aws.bucket,
        Key: `${destinyFolder}/${file}`,
        ACL: 'public-read',
        Body: fileContent,
        ContentType,
      })
      .promise()

    await fs.promises.unlink(originalPath)

    return file
  },

  async deleteFile(file, destinyFolder) {
    await client
      .deleteObject({
        Bucket: uploadConfig.config.aws.bucket,
        Key: `${destinyFolder}/${file}`,
      })
      .promise()
  },
}

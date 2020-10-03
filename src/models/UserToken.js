const mongoose = require('../config/database')
const uuid = require('uuid')

const UserTokenSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuid.v4 },

    user_id: {
      type: String,
      default: uuid.v4,
      ref: 'User',
    },

    token: {
      type: String,
      default: uuid.v4,
    },
  },
  { timestamps: true }
)

const UserToken = mongoose.model('UserToken', UserTokenSchema)

module.exports = UserToken

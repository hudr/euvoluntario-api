const mongoose = require('../config/database')
const uuid = require('uuid')

const UserNotificationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuid.v4 },

    sender: {
      type: String,
      require: true,
    },

    message: {
      type: String,
      require: true,
    },

    status: {
      type: String,
      require: true,
    },

    charityName: {
      type: String,
      require: true,
    },

    user_id: {
      type: String,
      default: uuid.v4,
      ref: 'User',
    },
  },
  { timestamps: true }
)

const UserNotification = mongoose.model('UserNotification', UserNotificationSchema)

module.exports = UserNotification

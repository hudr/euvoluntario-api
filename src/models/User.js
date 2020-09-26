const mongoose = require('../config/database')
const uuid = require('uuid')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuid.v4 },

    name: {
      type: String,
      require: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    address: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ['entity', 'volunteer'],
      required: true,
    },

    cnpj: {
      type: String,
      default: null,
      required: function () {
        return this.role === 'entity'
      },
    },
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.password, 10)
  this.password = hash
  next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User

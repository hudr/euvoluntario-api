const mongoose = require('../config/database')
const uuid = require('uuid')

const CharityScheema = new mongoose.Schema(
  {
    _id: { type: String, default: uuid.v4 },
    title: {
      type: String,
      require: true,
    },

    description: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    assignedTo: {
      type: String,
      default: uuid.v4,
      ref: 'User',
      required: true,
    },

    volunteers: [
      {
        _id: { type: String, default: uuid.v4 },

        user: {
          type: String,
          default: uuid.v4,
          ref: 'User',
        },

        approved: {
          type: String,
          default: 'false',
        },
      },
    ],

    completed: {
      type: Boolean,
      require: true,
      default: false,
    },
  },
  { timestamps: true }
)

const Charity = mongoose.model('Charity', CharityScheema)

module.exports = Charity

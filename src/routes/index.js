const express = require('express')
const routes = express.Router()

const usersRouter = require('./users')
const charitiesRouter = require('./charity')

routes.use('/user', usersRouter)
routes.use('/charity', charitiesRouter)

module.exports = routes

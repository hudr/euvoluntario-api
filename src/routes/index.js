const express = require('express')
const routes = express.Router()

const usersRouter = require('./users')
const charitiesRouter = require('./charity')
const dashboardRouter = require('./dashboard')

routes.use('/user', usersRouter)
routes.use('/charity', charitiesRouter)
routes.use('/dashboard', dashboardRouter)

module.exports = routes

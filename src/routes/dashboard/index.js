const express = require('express')
const dashboardRouter = express.Router()
const DashboardController = require('../../controllers/Dashboard')

dashboardRouter.get('/', DashboardController.index)

module.exports = dashboardRouter
const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { getChannelStats, getChannelVideos } = require('../controllers/dashboardController')

const dashboardRouter = express.Router()

dashboardRouter.use(authMiddleware)

dashboardRouter.get('/stats',getChannelStats)
dashboardRouter.get('/videos',getChannelVideos)

module.exports = dashboardRouter
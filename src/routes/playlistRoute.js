const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist } = require('../controllers/playlistController')

const playlistRoute = express.Router()

playlistRoute.use(authMiddleware)

playlistRoute.post("/create",createPlaylist)
playlistRoute.get('/all/:userId',getUserPlaylists)
playlistRoute.get('/:playlistId',getPlaylistById)
playlistRoute.post('/addVideo/:playlistId/:videoId',addVideoToPlaylist)
playlistRoute.delete('/removeVideo/:playlistId/:videoId',removeVideoFromPlaylist)
playlistRoute.delete('/deletePlaylist/:playlistId',deletePlaylist)
playlistRoute.patch('/update/:playlistId',updatePlaylist)

module.exports = playlistRoute
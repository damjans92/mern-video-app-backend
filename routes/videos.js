import express from 'express'
import {
  addVideo,
  addView,
  deleteVideo,
  getByTag,
  getLikedVideos,
  getOtherUserVideos,
  getUserVideos,
  getVideo,
  sorted,
  search,
  sub,
  trend,
  updateVideo,
} from '../controllers/video.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()

//add a video
router.post('/', verifyToken, addVideo)

//delete a video
router.delete('/:id', verifyToken, deleteVideo)

//update a video
router.put('/:id', verifyToken, updateVideo)

//get a video
router.get('/find/:id', getVideo)

//get my videos
router.get('/findmyvideos', verifyToken, getUserVideos)

//get specific user videos
router.get('/finduservideos/:id', getOtherUserVideos)

//new view
router.put('/view/:id', addView)

//get trending videos
router.get('/trend', trend)

//get sorted videos
router.get('/sorted', sorted)

//get subscribed videos
router.get('/sub', verifyToken, sub)

//get videos by tag
router.get('/tags', getByTag)

//search videos
router.get('/search', search)

//get liked videos
router.get('/liked', verifyToken, getLikedVideos)

export default router

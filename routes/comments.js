import express from 'express'
import {
  addComment,
  deleteComment,
  getComments,
} from '../controllers/comment.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()

//add new comment
router.post('/', verifyToken, addComment)

//delete a comment
router.delete('/:id', verifyToken, deleteComment)

//get comments of a video
router.get('/:videoId', getComments)

export default router

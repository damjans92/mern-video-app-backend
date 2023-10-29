import express from 'express'
import {
  googleAuth,
  logout,
  resetPassword,
  signin,
  signup,
} from '../controllers/auth.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()

//create a user
router.post('/signup', signup)

//sign in
router.post('/signin', signin)

//google auth
router.post('/google', googleAuth)

//logout
router.post('/logout', logout)

//reset password
router.put('/reset', verifyToken, resetPassword)

export default router

import mongoose from 'mongoose'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import { createError } from '../error.js'
import jwt from 'jsonwebtoken'

// Sign Up
export const signup = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(req.body.password, salt)
    const newUser = new User({ ...req.body, password: hash })

    await newUser.save()
    console.log(newUser)
    res.status(200).send('User has been created')
  } catch (err) {
    next(err)
  }
}

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(req.body.password, salt)

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: { password: hash },
      },
      { new: true }
    )

    res.status(200).send('Password has been changed')
  } catch (err) {
    next(err)
  }
}

// Sign in
export const signin = async (req, res, next) => {
  try {
    const user = await User.findOne({ name: req.body.name })
    if (!user) return next(createError(404, 'User not found'))

    const isCorrect = await bcrypt.compare(req.body.password, user.password)
    if (!isCorrect) return next(createError(404, 'Wrong credentials'))

    // Create the access token with a shorter expiry
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: '1h',
    })

    // Create the refresh token with a longer expiry
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: '7d',
    })

    const { password, ...others } = user._doc

    // Set the access token as an HTTP-only cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'none',
    })

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
    })

    res.status(200).json(others)
  } catch (err) {
    next(err)
  }
}
// export const signin = async (req, res, next) => {
//   try {
//     const user = await User.findOne({ name: req.body.name })
//     if (!user) return next(createError(404, 'User not found'))

//     const isCorrect = await bcrypt.compare(req.body.password, user.password)
//     if (!isCorrect) return next(createError(404, 'Wrong credentials'))

//     const token = jwt.sign({ id: user._id }, process.env.JWT)
//     const { password, ...others } = user._doc
//     res
//       .cookie('access_token', token, {
//         httpOnly: true,
//       })
//       .status(200)
//       .json(others)
//   } catch (err) {
//     next(err)
//   }
// }

// Google sign in
export const googleAuth = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      console.log('ima usera')
      const token = jwt.sign({ id: user._id }, process.env.JWT)
      if (token) console.log('token je ' + token)
      res
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .status(200)
        .json(user._doc)
    } else {
      const newUser = new User({
        ...req.body,
        fromGoogle: true,
      })
      const savedUser = await newUser.save()
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT, {
        expiresIn: '7d',
      })
      res
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .status(200)
        .json(savedUser._doc)
    }
  } catch (err) {
    next(err)
  }
}

// Log out
export const logout = async (req, res, next) => {
  try {
    res
      .clearCookie('access_token', { httpOnly: true })
      .status(200)
      .send('Cookie cleared')
  } catch (error) {
    next(error)
  }
}

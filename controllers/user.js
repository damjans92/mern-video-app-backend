import { createError } from '../error.js'
import User from '../models/User.js'
import Video from '../models/Video.js'

// Update user
export const updateUser = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      )
      res.status(200).json(updatedUser)
    } catch (err) {
      next(err)
    }
  } else {
    return next(createError(403, 'You can update only your account!'))
  }
}

// Delete user
export const deleteUser = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      res.clearCookie('refresh_token')

      await User.findByIdAndDelete(req.params.id)
      res.status(200).json('User has been deleted.')
    } catch (err) {
      next(err)
    }
  } else {
    return next(createError(403, 'You can delete only your account!'))
  }
}

// Get user
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

// Subsribe to user
export const subscribe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $push: { subscribedUsers: req.params.id },
    })
    //find the target channel by id and push subscriber id in the array
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { subscribers: 1 },
    })
    res.status(200).json('Subscription successful!')
  } catch (error) {
    next(error)
  }
}

// Unsubsribe to user
export const unsubscribe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { subscribedUsers: req.params.id },
    })

    await User.findByIdAndUpdate(req.params.id, {
      $inc: { subscribers: -1 },
    })
    res.status(200).json('Unsubscription successful!')
  } catch (error) {
    next(error)
  }
}

// Like a video
export const like = async (req, res, next) => {
  const id = req.user.id
  const videoId = req.params.videoId
  try {
    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { likes: id },
      $pull: { dislikes: id },
    })
    res.status(200).json('The video has been liked')
  } catch (error) {
    next(error)
  }
}

// Disike a video
export const dislike = async (req, res, next) => {
  const id = req.user.id
  const videoId = req.params.videoId
  try {
    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { dislikes: id },
      $pull: { likes: id },
    })
    res.status(200).json('The video has been disliked')
  } catch (error) {
    next(error)
  }
}

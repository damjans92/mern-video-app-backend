import { createError } from '../error.js'
import User from '../models/User.js'
import Video from '../models/Video.js'

// New video
export const addVideo = async (req, res, next) => {
  const newVideo = new Video({ userId: req.user.id, ...req.body })
  try {
    const savedVideo = await newVideo.save()
    res.status(200).json(savedVideo)
  } catch (error) {
    next(error)
  }
}

// Update a video
export const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
    if (!video) return next(createError(404, 'Video not found!'))

    if (req.user.id === video.userId) {
      const updatedVideo = await Video.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      )
      res.status(200).json(updatedVideo)
    }
  } catch (error) {
    next(createError(403, 'You can update only your video!'))
  }
}

// Get video
export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
    res.status(200).json(video)
  } catch (error) {
    next(error)
  }
}

// Get my videos
export const getUserVideos = async (req, res, next) => {
  const id = req.user.id
  try {
    const videos = await Video.find({ userId: id })

    res.status(200).json(videos)
  } catch (error) {
    // Handle errors appropriately
    console.error('Error in getUserVideos:', error)

    // Check if headers have already been sent
    if (res.headersSent) {
      return next(error) // Pass the error to the next middleware or error handler
    }

    // Send a response with an error status and message
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// Get specific user video
export const getOtherUserVideos = async (req, res, next) => {
  const id = req.params.id

  try {
    const videos = await Video.find({ userId: { $in: id } })

    res.status(200).json(videos)
  } catch (error) {
    next(error)
  }
}

// Delete a video
export const deleteVideo = async (req, res, next) => {
  const video = await Video.findById(req.params.id)
  if (req.user.id === video.userId) {
    try {
      const deletedVideo = await Video.findByIdAndDelete(req.params.id)
      res.status(200).json(deletedVideo)
    } catch (error) {
      next(error)
    }
  }
}

// Add view to video
export const addView = async (req, res, next) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    })
    res.status(200).json('The view has been increased.')
  } catch (error) {
    next(error)
  }
}

// Get a list of sorted videos
export const sorted = async (req, res, next) => {
  const skip = req.query.skip ? Number(req.query.skip) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 10
  try {
    const videos = await Video.find({ visibility: 'published' })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
    res.status(200).json(videos)
  } catch (error) {
    next(error)
  }
}

// Get a list of trending videos
export const trend = async (req, res, next) => {
  const skip = req.query.skip ? Number(req.query.skip) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 10
  try {
    const videos = await Video.find({ visibility: 'published' })
      .sort({
        views: -1,
      })
      .skip(skip)
      .limit(limit)
    res.status(200).json(videos)
  } catch (error) {
    next(error)
  }
}

// Get video list of subscriptions
export const sub = async (req, res, next) => {
  console.log('Handling /sub route')
  console.log('Subscription videos USER: ', req.user)
  const skip = req.query.skip ? Number(req.query.skip) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 10
  try {
    const user = await User.findById(req.user.id)

    if (!user || !user.subscribedUsers) {
      return res.status(200).json([])
    }

    const subscribedChannels = user.subscribedUsers
    console.log('SubCHANNELS: ' + subscribedChannels)
    if (subscribedChannels.length === 0) {
      return res.status(200).json([])
    }

    const list = await Promise.all(
      subscribedChannels.map(async (channelId) => {
        return await Video.find({ userId: channelId })
      })
    )

    // Combine the lists from different channels into one array
    const combinedList = list.flat()

    // Apply sorting, skipping, and limiting to the combined list
    combinedList.sort((a, b) => b.createdAt - a.createdAt)
    const paginatedList = combinedList.slice(skip, skip + limit)

    res.status(200).json(paginatedList)
  } catch (err) {
    next(err)
  }
}

// Get video list by tag
export const getByTag = async (req, res, next) => {
  const tags = req.query.tags.split(',')
  try {
    const videos = await Video.find({ tags: { $in: tags } }).limit(20)
    res.status(200).json(videos)
  } catch (error) {
    next(error)
  }
}

// Search videos
export const search = async (req, res, next) => {
  const query = req.query.q

  try {
    const videos = await Video.find({
      title: { $regex: query, $options: 'i' },
    }).limit(20)
    res.status(200).json(videos)
  } catch (error) {
    next(error)
  }
}

// Get Liked videos
export const getLikedVideos = async (req, res, next) => {
  const id = req.user.id

  try {
    const videos = await Video.find({
      likes: { $in: id },
    })
    res.status(200).json(videos)
  } catch (error) {
    next(error)
  }
}

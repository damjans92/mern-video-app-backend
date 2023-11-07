import jwt from 'jsonwebtoken'
import { createError } from './error.js'

export const verifyToken = (req, res, next) => {
  const accessToken = req.cookies.access_token
  const refreshToken = req.cookies.refresh_token

  if (!accessToken) {
    return next(createError(401, 'You are not authenticated'))
  }

  jwt.verify(accessToken, process.env.JWT, (err, user) => {
    if (err) {
      if (refreshToken) {
        jwt.verify(refreshToken, process.env.JWT, (err, user) => {
          if (err) {
            return next(
              createError(403, 'Access and refresh tokens are not valid.')
            )
          }

          // Refresh token is valid. Issue a new access token.
          const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT)
          res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            // Other cookie options
          })

          // Continue processing the request with the new access token.
          req.user = user
          next()
        })
      } else {
        return next(createError(403, 'Access token is not valid.'))
      }
    } else {
      // Access token is valid. Continue processing the request.
      req.user = user
      next()
    }
  })
}

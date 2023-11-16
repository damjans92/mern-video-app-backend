import jwt from 'jsonwebtoken'
import { createError } from './error.js'

export const verifyToken = (req, res, next) => {
  const accessToken = req.cookies.access_token
  const refreshToken = req.cookies.refresh_token

  if (!accessToken) {
    if (refreshToken) {
      // Attempt to refresh the access token using the refresh token
      jwt.verify(refreshToken, process.env.JWT, (err, user) => {
        if (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error verifying refresh token:', err)
          }
          return next(
            createError(403, 'Access and refresh tokens are not valid.')
          )
        }

        // Refresh token is valid. Issue a new access token.
        const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT, {
          expiresIn: '1h',
        })

        res.cookie('access_token', newAccessToken, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          maxAge: 1 * 60 * 60 * 1000,
          domain: 'drab-plum-buffalo-ring.cyclic.app',
          // Other cookie options
        })

        // Continue processing the request with the new access token.
        req.user = user
        return next()
      })
    } else {
      return next(createError(401, 'You are not authenticated'))
    }
  } else {
    // Add the else statement here
    jwt.verify(accessToken, process.env.JWT, (err, user) => {
      if (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error verifying access token:', err)
        }
        return next(createError(403, 'Access token is not valid.'))
      }

      // Access token is valid. Continue processing the request.
      req.user = user
      next()
    })
  }
}

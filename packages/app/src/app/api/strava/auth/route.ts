import { setCookie } from 'cookies-next'
import jwt from 'jsonwebtoken'
import { NextResponse, NextRequest } from 'next/server'
import appStrava from '../../../strava-core/strava'
import { AuthRepository } from '../../../strava-modules/auth/AuthRepository'
import { UserRepository } from '../../../strava-modules/user/UserRepository'

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (req.method !== 'POST') {
    const result = { message: 'method needs to be POST' }
    return NextResponse.json(result, {
      status: 404,
    })
  }

  if (!body.code) {
    const result = { message: 'User access code missing in request body' }
    return NextResponse.json(result, {
      status: 401,
    })
  }

  const handleTokenExchange = (err: Error | null) => {
    if (err) {
      // Handle error
      console.error('Error exchanging token:')
    } else {
      // Token exchange successful, handle payload
      console.log('Token exchange successful')
      // Typically, you would store the access token or perform further actions here
    }
  }

  const userRepository = new UserRepository()

  const stravaToken = await appStrava.oauth.getToken(body.code, handleTokenExchange)

  if (!stravaToken.athlete.id) {
    const result = { message: 'Athlete ID missing in stravaToken' }
    return NextResponse.json(result, {
      status: 401,
    })
  }

  const user = userRepository.readUser(String(stravaToken.athlete.id))

  if (user === undefined) {
    userRepository.createUser({
      id: stravaToken.athlete.id,
      firstName: stravaToken.athlete.firstname,
      lastName: stravaToken.athlete.lastname,
    })
  }

  const token = jwt.sign(
    {
      id: stravaToken.athlete.id,
    },
    process.env.JWT_KEY!,
    {
      expiresIn: Number(process.env.JWT_EXPIRES_IN),
    }
  )

  const authRepository = new AuthRepository()
  authRepository.createAuth({
    userId: stravaToken.athlete.id,
    accessToken: stravaToken.access_token,
    refreshToken: stravaToken.refresh_token,
    expiresAt: stravaToken.expires_at,
    expiresIn: stravaToken.expires_in,
  })

  // Set the cookie
  const maxAgeInSeconds = stravaToken.expires_in
  const cookieValue = `accessToken=${token}; Max-Age=${maxAgeInSeconds}; Path=/; HttpOnly`
  console.log(cookieValue)
  const headers = { 'Set-Cookie': cookieValue }

  const result = { accessToken: token }
  return NextResponse.json(result, {
    status: 200,
    headers,
  })
}

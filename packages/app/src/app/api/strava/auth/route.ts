import jwt from 'jsonwebtoken'
import { NextResponse, NextRequest } from 'next/server'
import appStrava from '../../../strava-core/strava'
import { supabase } from '@/utils/supabase'

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

  // const userRepository = new UserRepository()

  const stravaToken = await appStrava.oauth.getToken(body.code, handleTokenExchange)
  console.log('strava token is')
  console.log(stravaToken)

  if (!stravaToken.athlete.id) {
    const result = { message: 'Athlete ID missing in stravaToken' }
    return NextResponse.json(result, {
      status: 401,
    })
  }

  // Create or update user record
  const { data: user, error: userError } = await supabase.from('user').upsert(
    {
      id: stravaToken.athlete.id,
      firstname: stravaToken.athlete.firstname,
      lastname: stravaToken.athlete.lastname,
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  if (userError) {
    const result = { message: 'Error with supabase user' }
    console.error(userError.message)
    return NextResponse.json(result, {
      status: 500,
    })
  }

  // Store authentication information
  const { data: auth, error: authError } = await supabase.from('auth').upsert(
    {
      userId: stravaToken.athlete.id,
      accessToken: stravaToken.access_token,
      refreshToken: stravaToken.refresh_token,
      expiresAt: stravaToken.expires_at,
      expiresIn: stravaToken.expires_in,
    },
    { onConflict: 'userId', ignoreDuplicates: true }
  )

  if (authError) {
    const result = { message: 'Error with supabase auth' }
    console.error(authError.message)
    return NextResponse.json(result, {
      status: 500,
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

  // Set the cookie
  const maxAgeInSeconds = stravaToken.expires_in
  const cookieValue = `accessToken=${token}; Max-Age=${maxAgeInSeconds}; Path=/; HttpOnly`
  const headers = { 'Set-Cookie': cookieValue }

  const result = { accessToken: token }
  return NextResponse.json(result, {
    status: 200,
    headers,
  })
}

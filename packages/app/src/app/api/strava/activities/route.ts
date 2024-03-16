import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
// import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse, NextRequest } from 'next/server'
import { AuthRepository } from '../../../strava-modules/auth/AuthRepository'
import stravaV3, { DetailedActivityResponse } from 'strava-v3'

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    const result = { message: 'method needs to be POST' }
    return NextResponse.json(result, {
      status: 404,
    })
  }

  /**
   * Verifying Auth
   */

  let accessToken: string | undefined

  const cookieStore = cookies()
  const cookieDough = cookieStore.get('accessToken')

  if (cookieDough) {
    accessToken = cookieDough.value
  }

  if (!accessToken || !jwt.verify(accessToken, process.env.JWT_KEY!)) {
    const result = { message: 'access token missing' }
    return NextResponse.json(result, {
      status: 401,
    })
  }

  const authRepository = new AuthRepository()
  const decodedAccessToken = jwt.decode(accessToken)

  if (decodedAccessToken === null || typeof decodedAccessToken === 'string') {
    const result = { message: 'access token not decoded' }
    return NextResponse.json(result, {
      status: 401,
    })
  }

  const auth = authRepository.readAuth(decodedAccessToken.id)

  if (!auth) {
    const result = { message: 'Auth invalid' }
    return NextResponse.json(result, {
      status: 401,
    })
  }

  /**
   * Getting activities from Strava
   */
  stravaV3.client(auth.accessToken)
  const activities: DetailedActivityResponse[] = await stravaV3.athlete.listActivities({ per_page: 10 })

  const result = { activities }
  return NextResponse.json(result, {
    status: 200,
  })
}

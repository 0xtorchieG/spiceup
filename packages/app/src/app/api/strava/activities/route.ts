import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { NextResponse, NextRequest } from 'next/server'
import { AuthRepository } from '../../../strava-modules/auth/AuthRepository'
import stravaV3, { DetailedActivityResponse } from 'strava-v3'
import { supabase } from '@/utils/supabase'

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

  const decodedAccessToken = jwt.decode(accessToken)

  if (decodedAccessToken === null || typeof decodedAccessToken === 'string') {
    const result = { message: 'access token not decoded' }
    return NextResponse.json(result, {
      status: 401,
    })
  }

  const { data: auth, error: authError } = await supabase
    .from('auth')
    .select()
    .eq('userId', decodedAccessToken.id)
    .single()

  if (!auth || authError) {
    console.error(authError?.message || 'Auth information not found')
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

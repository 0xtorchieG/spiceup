'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import StravaAuth from './strava-auth'
import StravaProfile from './strava-profile'

export default function Home() {
  const searchParams = useSearchParams()
  const [stravaConnected, setStravaConnected] = useState<boolean>(false)

  const checkConnection = useCallback(async () => {
    const auth_code = searchParams.get('code')

    if (auth_code) {
      setStravaConnected(true)
    }

    if (!auth_code) {
      setStravaConnected(false)
    }
  }, [searchParams])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className='container m-5 min-h-full w-full'>
      <div className='rounded-lg'>
        {stravaConnected === false && <StravaAuth />}
        {stravaConnected === true && <StravaProfile />}
      </div>
    </div>
  )
}

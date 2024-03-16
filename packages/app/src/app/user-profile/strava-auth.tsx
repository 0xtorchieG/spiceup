'use client'

import React from 'react'
import { useCallback, useState } from 'react'
import Link from 'next/link'
import { getStravaAuthUrl } from '../strava-modules/auth/functions/getStravaAuthUrl'

export default function StravaAuth() {
  const [authToken, setAuthToken] = useState<string>()

  const onSignout = useCallback(() => {
    setAuthToken(undefined)
  }, [])

  return (
    <>
      <div className='mt-5'>
        {authToken === undefined && (
          <Link href={getStravaAuthUrl()}>
            <button className='btn btn-secondary'>Connect your Strava Account</button>
          </Link>
        )}
        {authToken !== undefined && (
          <div>
            <button onClick={onSignout} className='btn btn-outline btn-secondary'>
              Disconnect your Strava Account
            </button>
          </div>
        )}
      </div>
    </>
  )
}

'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function StravaProfile() {
  const searchParams = useSearchParams()
  const [authStatus, setAuthStatus] = useState<string>()
  const [authToken, setAuthToken] = useState<string>()

  const signin = useCallback(async () => {
    const auth_code = searchParams.get('code')

    if (!auth_code) {
      return
    }

    const response = await fetch('/api/strava/auth', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: auth_code }),
      credentials: 'same-origin',
    })

    if (!response.ok) {
      return
    }

    if (response.ok) {
      setAuthStatus('Logged In')
      const data = await response.json()
      setAuthToken(data.accessToken)
    }
  }, [searchParams])

  useEffect(() => {
    signin()
  }, [signin])

  return (
    <div className='container'>
      <div className='rounded-lg'>
        <div className='w-11/12'>
          {authStatus === undefined && (
            <div>
              <span className='loading loading-spinner loading-md text-primary'></span>
              <p>Please wait as we are connecting to your Strava account</p>
            </div>
          )}
          {authStatus !== undefined && (
            <div className='mt-5'>
              <button className='btn btn-secondary'>Fetch Strava activities</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

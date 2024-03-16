'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import StravaActivityCard from './strava-activity-card'

interface StravaActivity {
  id: number
  name: string
  type: string
  start_date: string
  elapsed_time: number
  distance: number
  has_heartrate: boolean
  max_heartrate: number
}

export default function StravaProfile() {
  const searchParams = useSearchParams()
  const [authStatus, setAuthStatus] = useState<string>()
  const [authToken, setAuthToken] = useState<string>()
  const [activities, setActivities] = useState<StravaActivity[]>([])

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

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch('/api/strava/activities', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: authToken }),
      })

      const data = await response.json()

      setActivities(data.activities)
    } catch {}
  }, [authToken])

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
              <button className='btn btn-secondary' onClick={fetchActivities}>
                Fetch Strava activities
              </button>
            </div>
          )}
        </div>
        <div className='flex flex-col mt-5 gap-3'>
          {activities.length > 0 && (
            <div>
              <h1 className=' font-bold text-lg'> Your latest Strava activities</h1>
              <div className='grid grid-cols-4 gap-3'>
                {activities.slice(0, 6).map((activity) => (
                  <div key={activity.id}>
                    {activity.has_heartrate ? (
                      <StravaActivityCard
                        activityId={activity.id}
                        activityName={activity.name}
                        activityType={activity.type}
                        activityStartDate={activity.start_date}
                        activityElapsedTime={activity.elapsed_time}
                        activityDistance={activity.distance}
                        activityHeartrate={activity.max_heartrate}
                      />
                    ) : (
                      <StravaActivityCard
                        activityId={activity.id}
                        activityName={activity.name}
                        activityType={activity.type}
                        activityStartDate={activity.start_date}
                        activityElapsedTime={activity.elapsed_time}
                        activityDistance={activity.distance}
                        activityHeartrate={0}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

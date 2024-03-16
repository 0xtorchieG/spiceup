'use client'

import React, { useState, useEffect } from 'react'
import LogDataAction from './log-data-action'

interface LogDataProps {
  activityId: number
  duration: number
  distance: number
  heartrate: number
  address: `0x${string}`
}

const LogData: React.FC<LogDataProps> = ({ activityId, distance, duration, heartrate, address }) => {
  const [challengeId, setChallengeId] = useState<number | ''>('')

  return (
    <div className='modal-box'>
      <h3 className='font-bold text-lg mb-5'>Log the activity</h3>
      <form method='dialog'>
        <div className='flex justify-start content-center h-10'>
          <label>
            Challenge Id to log into:
            <input
              type='number'
              className='input input-bordered input-sm input-secondary ml-3 mr-3'
              value={challengeId}
              onChange={(e) => setChallengeId(parseInt(e.target.value))}
              placeholder='Input Challenge Id'
              required
            />
          </label>
        </div>
      </form>
      {challengeId === '' ? (
        <div className='modal-action'>
          <button
            onClick={() => {
              const modal = document.getElementById(`my_modal_${activityId}`) as HTMLDialogElement
              if (modal) {
                modal.close()
              }
            }}
            type='button'
            className='btn'>
            Cancel
          </button>
        </div>
      ) : (
        <LogDataAction
          challengeId={challengeId}
          activityId={activityId}
          distance={distance}
          duration={duration}
          heartrate={heartrate}
          address={address}
        />
      )}
    </div>
  )
}

export default LogData

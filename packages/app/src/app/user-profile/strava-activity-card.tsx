'use client'

import { useEffect, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { contractAddress, spiceUpAbi } from '@/utils/contractDetails'
import LogData from './log-data'

interface CardProps {
  activityId: number
  activityName: string
  activityType: string
  activityStartDate: string
  activityElapsedTime: number
  activityDistance: number
  activityHeartrate: number
}

const StravaActivityCard: React.FC<CardProps> = ({
  activityId,
  activityName,
  activityType,
  activityStartDate,
  activityElapsedTime,
  activityDistance,
  activityHeartrate,
}) => {
  const [isLogged, setIsLogged] = useState<boolean>(false)

  const { address } = useAccount()

  const getActivityLogged = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'activityLogged',
    args: [address as `0x${string}`, BigInt(activityId)],
  })

  const convertMetersToKilometers = (distanceInMeters: number): number => {
    return distanceInMeters / 1000 // 1 kilometer = 1000 meters
  }

  const formatDuration = (durationInSeconds: number): string => {
    const hours = Math.floor(durationInSeconds / 3600)
    const minutes = Math.floor((durationInSeconds % 3600) / 60)
    const seconds = durationInSeconds % 60

    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    // Format the date as desired, for example:
    return date.toLocaleString() // Adjust the format based on your preference
  }

  useEffect(() => {
    if (getActivityLogged.data !== undefined) {
      setIsLogged(getActivityLogged.data)
    }
  }, [getActivityLogged.data])

  return (
    <div className='card w-72 bg-neutral shadow-xl'>
      <div className='card-body'>
        <h2 className='card-title'>{activityName}</h2>
        <div>
          Type: <div className='badge'>{activityType}</div>
        </div>
        <div>
          Date:<div className='badge'>{formatTimestamp(activityStartDate)}</div>
        </div>
        <div>
          Duration:<div className='badge'>{formatDuration(activityElapsedTime)} </div>
        </div>
        <div>
          Distance:<div className='badge'>{convertMetersToKilometers(activityDistance).toFixed(2)} </div>
        </div>
        <div className='card-actions w-full justify-end'>
          <button
            className='btn btn-secondary'
            onClick={() => {
              const modal = document.getElementById(`my_modal_${activityId}`) as HTMLDialogElement
              if (modal) {
                modal.showModal()
              }
            }}
            disabled={isLogged}>
            {isLogged ? 'Acitivity already logged' : 'Log activity'}
          </button>
        </div>
      </div>
      <dialog id={`my_modal_${activityId}`} className='modal modal-bottom lg:modal-middle'>
        <LogData
          activityId={activityId}
          distance={convertMetersToKilometers(activityDistance)}
          duration={activityElapsedTime}
          heartrate={activityHeartrate}
          address={address || '0x0000000000000000000000000000000000000000'}
        />
      </dialog>
    </div>
  )
}

export default StravaActivityCard

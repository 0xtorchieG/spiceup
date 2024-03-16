'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { contractAddress, spiceUpAbi } from '@/utils/contractDetails'
import { type BaseError, useWaitForTransactionReceipt, useWriteContract, useReadContract } from 'wagmi'

interface LogDataAction {
  challengeId: number
  activityId: number
  duration: number
  distance: number
  heartrate: number
  address: `0x${string}`
}

const LogDataAction: React.FC<LogDataAction> = ({
  challengeId,
  activityId,
  distance,
  duration,
  heartrate,
  address,
}) => {
  const [valueToLog, setValueToLog] = useState<number>()
  const [challengeTitle, setChallengeTitle] = useState<string>('')
  const [challengeEnded, setChallengeEnded] = useState<boolean>(false)
  const [valueLargeEnough, setValueLargeEnough] = useState<boolean>(true)
  const [hasEnteredCheck, setHasEnteredCheck] = useState<boolean>(true)
  const [buttonLabel, setButtonLabel] = useState<string>('Log activity')

  const { data: hash, isPending, error, writeContract } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const getChallengesEnteredIdArray = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'getChallengesEnteredByParticipant',
    args: [address as `0x${string}`],
  })

  const getChallengeById = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'challenges',
    args: [BigInt(challengeId)],
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (challengeId !== undefined && valueToLog !== undefined && activityId !== undefined) {
      const createParams: [bigint, bigint, bigint] = [BigInt(challengeId), BigInt(valueToLog), BigInt(activityId)]

      writeContract({
        address: contractAddress,
        abi: spiceUpAbi,
        functionName: 'logValue',
        args: createParams,
      })
    }
  }

  useEffect(() => {
    if (getChallengesEnteredIdArray.data !== undefined) {
      const idArray = getChallengesEnteredIdArray.data
      const numberIdArray = idArray.map((bigIntValue) => Number(bigIntValue))
      const challengeEnteredIdArray = Array.from({ length: numberIdArray.length }, (_, index) => index).reverse()
      // setChallengesEnteredIds(challengeEnteredIdArray)
      if (challengeId !== undefined) {
        if (challengeEnteredIdArray.includes(challengeId)) {
          setHasEnteredCheck(false)
          setButtonLabel(`Challenge ID ${challengeId} not entered`)
        }
      }
    }
  }, [getChallengesEnteredIdArray.data, challengeId])

  useEffect(() => {
    if (challengeId !== undefined && getChallengeById.data) {
      const resultTuple: readonly [
        bigint,
        string,
        bigint,
        bigint,
        bigint,
        string,
        bigint,
        string,
        number,
        boolean,
        boolean,
        boolean,
      ] = getChallengeById.data

      //*set the title to then again show "you are about to log this value to: challenge title"
      setChallengeTitle(resultTuple[1])

      //*check if the challenge has ended already or not
      const endTime = resultTuple[4]
      const currentTime = Math.floor(Date.now() / 1000)
      if (currentTime > endTime) {
        setChallengeEnded(true)
        setButtonLabel('Challenge ended')
      }

      //Check if value to log larger than minimum requirement
      if (resultTuple[8] == 0) {
        setValueToLog(Math.floor(distance))
        if (distance <= Number(resultTuple[2])) {
          setValueLargeEnough(false)
          console.log(Number(resultTuple[2]))
          setButtonLabel('Distance smaller then minimum requirement')
        }
      }
      if (resultTuple[8] == 1) {
        setValueToLog(duration)
        if (duration <= Number(resultTuple[2])) {
          setValueLargeEnough(false)
          setButtonLabel('Duration smaller then minimum requirement')
        }
      }
      if (resultTuple[8] == 2) {
        setValueToLog(heartrate)
        if (heartrate <= Number(resultTuple[2])) {
          setValueLargeEnough(false)
          setButtonLabel('Heartrate smaller then minimum requirement')
        }
        if (heartrate == 0) {
          setButtonLabel('Activity misses heartrate')
        }
      }
    }
  }, [getChallengeById.data, challengeId, distance, duration, heartrate])

  return (
    <div>
      <form method='dialog' onSubmit={handleSubmit}>
        {challengeTitle !== '' && <div>You are about to log activity for {challengeTitle}</div>}
        <p> The distance is {distance}</p>
        <div className='modal-action'>
          <button
            type='submit'
            className='btn'
            disabled={
              isPending || challengeEnded || !valueLargeEnough || !hasEnteredCheck || challengeId === undefined
            }>
            {isPending ? 'Logging...' : buttonLabel}
          </button>
          <button
            onClick={() => {
              const modal = document.getElementById(`my_modal_${activityId}`) as HTMLDialogElement
              if (modal) {
                modal.close()
              }
            }}
            type='button'
            className='btn'>
            {isConfirmed ? 'Close' : 'Cancel'}
          </button>
        </div>
        <div>
          {error && (
            <div role='alert' className='alert alert-error'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='stroke-current shrink-0 h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span>Error: {(error as BaseError).shortMessage || error.message}</span>
            </div>
          )}
          {hash && (
            <div role='alert' className='alert alert-success'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='stroke-current shrink-0 h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span>
                <Link href={`https://testnet.bscscan.com/tx/${hash}`} target='_blank'>
                  🔗 Txn hash: {hash.slice(0, 7) + '...' + hash.slice(-8)}
                </Link>
              </span>
            </div>
          )}
          {isConfirming && <div>Waiting for confirmation...</div>}
          {isConfirmed && (
            <div role='alert' className='alert alert-success'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='stroke-current shrink-0 h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span>🎉 Transaction confirmed!</span>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default LogDataAction

'use client'

import React, { useEffect, useState } from 'react'
import { useReadContract } from 'wagmi'
import { contractAddress, spiceUpAbi } from '@/utils/contractDetails'
import ChallengeDetails from './created-challenges-card-details'

interface Challenge {
  id: bigint
  title: string
  goalValue: bigint
  startTime: bigint
  endTime: bigint
  creator: string
  prizePool: bigint
  tokenAddress: string
  challengeType: number
  active: boolean
  feeClaimed: boolean
  tokenGateEnabled: boolean
}

interface CardProps {
  challengeId: number // Pass the challenge id as props
}

const Card: React.FC<CardProps> = ({ challengeId }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [challengeLiveChecker, setChallengeLiveChecker] = useState<boolean>(false)

  const getChallengeById = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'challenges',
    args: [BigInt(challengeId)],
    // config,
  })

  const checkChallengeLive = (startTime: bigint, endTime: bigint): boolean => {
    const currentTime = Math.floor(Date.now() / 1000)
    if (startTime > currentTime || currentTime > endTime) {
      return false
    }

    return true
  }

  useEffect(() => {
    if (getChallengeById.data) {
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

      // Convert the tuple to a Challenge object
      const challenge: Challenge = {
        id: resultTuple[0],
        title: resultTuple[1],
        goalValue: resultTuple[2],
        startTime: resultTuple[3],
        endTime: resultTuple[4],
        creator: resultTuple[5],
        prizePool: resultTuple[6],
        tokenAddress: resultTuple[7],
        challengeType: resultTuple[8],
        active: resultTuple[9],
        feeClaimed: resultTuple[10],
        tokenGateEnabled: resultTuple[11],
      }
      // Set the state with the array containing the challenge
      setChallenges([challenge])
      setChallengeLiveChecker(checkChallengeLive(challenge.startTime, challenge.endTime))
    }
  }, [getChallengeById.data])

  return (
    <div>
      {challenges.map((challenge) => (
        <div key={challenge.id} className='card glass w-80 shadow-xl pl-0'>
          <div className='card-body px-2'>
            {challengeLiveChecker ? (
              <>
                <h2 className='card-title text-md'>
                  {challenge.title}
                  <div className='badge badge-success gap-2'>Live</div>
                </h2>
                <ChallengeDetails challengeId={challengeId} />
              </>
            ) : challenge.startTime > Math.floor(Date.now() / 1000) ? (
              <h2 className='card-title text-md'>
                {challenge.title}
                <div className='badge badge-ghost gap-2'>Not started</div>
              </h2>
            ) : (
              <>
                <h2 className='card-title text-md'>
                  {challenge.title}
                  <div className='badge badge-ghost gap-2'>Finished</div>
                </h2>
                <ChallengeDetails challengeId={challengeId} />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Card

'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useReadContract } from 'wagmi'
import { contractAddress, spiceUpAbi } from '@/utils/contractDetails'
import ClaimPrize from '../challenges/claim-prize'
import { formatEther } from 'viem'

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
  challengeId: number
  address: `0x${string}`
}

const Card: React.FC<CardProps> = ({ challengeId, address }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [challengeLiveChecker, setChallengeLiveChecker] = useState<boolean>(false)
  const [imageURL, setImageURL] = useState<string>('')
  const [topTenAddresses, setTopTenAddresses] = useState<readonly `0x${string}`[]>([])
  const [topTenScores, setTopTenAddressesScores] = useState<readonly bigint[]>([])
  const [isInTopTen, setIsInTopTen] = useState<boolean>()
  const [position, setPosition] = useState<number>(10)

  const challengeTypes = ['Run: Distance', 'Run: Time', 'Heartrate']
  const challengeMetric = { 'Run: Distance': 'km', 'Run: Time': 'mins', Heartrate: 'bpm' }

  const getChallengeById = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'challenges',
    args: [BigInt(challengeId)],
  })

  const getChallengeLeaderboardById = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'getLeaderboard',
    args: [BigInt(challengeId)],
  })

  const checkChallengeLive = (startTime: bigint, endTime: bigint): boolean => {
    const currentTime = Math.floor(Date.now() / 1000)
    if (startTime > currentTime || currentTime > endTime) {
      return false
    }

    return true
  }

  const getImageURL = (challengeId: number, challengeType: number): string => {
    const imageID = (challengeId % 3) + 1
    const imageName = `${challengeTypes[challengeType]}${imageID}`
    const imagePath = '/images/' + imageName + '.png'
    return imagePath
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
      setImageURL(getImageURL(challengeId, challenge.challengeType))
    }
  }, [getChallengeById.data])

  useEffect(() => {
    if (getChallengeLeaderboardById.data) {
      const [addresses, scores] = getChallengeLeaderboardById.data
      setTopTenAddresses(addresses)
      setTopTenAddressesScores(scores)

      if (address) {
        const isAddressPresent = addresses.includes(address || '0x')
        setIsInTopTen(isAddressPresent)
        if (isAddressPresent) {
          setPosition(addresses.indexOf(address) + 1)
        }
      }
    }
  }, [getChallengeLeaderboardById.data, address])

  return (
    <div className='h-full'>
      {challenges.map((challenge) => (
        <div key={challenge.id} className='card card-side bg-base-300 shadow-xl px-4 h-full'>
          <figure>
            <Image
              src={imageURL}
              alt={challengeTypes[challenge.challengeType]}
              width={100}
              height={100}
              className='rounded-md'
            />
          </figure>
          <div className='card-body max-w-sm'>
            <h2 className='card-title text-lg'>
              {challenge.title.slice(0, 10)}
              <div className='badge badge-accent'>ID: {challengeId}</div>
            </h2>
            <div>
              Type:<div className='badge'>{challengeTypes[challenge.challengeType]}</div>
            </div>
            <div>
              Min entry:<div className='badge'>{Number(challenge.goalValue)}</div>
              {challengeMetric[challengeTypes[challenge.challengeType] as keyof typeof challengeMetric]}
            </div>
            <div>
              Prize pool:<div className='badge'>{Number(formatEther(challenge.prizePool))}</div> $CHZ
            </div>
            {isInTopTen && challengeLiveChecker && (
              <div>
                <h3 className='font-bold text-sm'>Keep it up 👏</h3>
                <h3 className='font-bold text-sm'>`You are on {position}. position`</h3>
              </div>
            )}
            <div className='card-actions justify-end'>
              {challenge.startTime > Math.floor(Date.now() / 1000) ? (
                <button className='btn btn-accent' disabled={true}>
                  Not yet started
                </button>
              ) : (
                position < 3 && !challengeLiveChecker && <ClaimPrize challengeId={challengeId} position={position} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Card

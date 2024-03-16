'use client'

import React, { useEffect, useState } from 'react'
import { useReadContract, useAccount } from 'wagmi'
import { contractAddress, spiceUpAbi } from '@/utils/contractDetails'
import ProfileStats from './profile-challenge-stats'
import Card from './challenges-participated-card'

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

export default function OnchainProfile() {
  const [challengesEnteredIds, setChallengesEnteredIds] = useState<number[]>([])
  const { address } = useAccount()

  const getChallengesEnteredIdArray = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'getChallengesEnteredByParticipant',
    args: [address as `0x${string}`],
  })

  useEffect(() => {
    if (getChallengesEnteredIdArray.data !== undefined) {
      const idArray = getChallengesEnteredIdArray.data
      const numberIdArray = idArray.map((bigIntValue) => Number(bigIntValue))
      const challengeEnteredIdArray = numberIdArray.reverse()
      setChallengesEnteredIds(challengeEnteredIdArray)
    }
  }, [getChallengesEnteredIdArray.data])

  return (
    <>
      {!address ? (
        <div>
          <span> Please connect your wallet </span>
        </div>
      ) : (
        <div>
          <ProfileStats address={address} numberOfChallenges={challengesEnteredIds.length} />
          <div className='mt-4'>
            <h2 className='font-bold text-lg'>Challenges you have entered into</h2>
            <div className='grid grid-cols-3 gap-1'>
              {challengesEnteredIds.map((challengeId) => (
                <Card key={challengeId} challengeId={challengeId} address={address} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

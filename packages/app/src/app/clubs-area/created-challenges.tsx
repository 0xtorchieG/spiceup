'use client'

import React, { useEffect, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { contractAddress, spiceUpAbi } from '@/utils/contractDetails'
import Card from './created-challenges-card'

export default function CreatedChallenges() {
  const [challengeCreatedIds, setChallengeCreatedIds] = useState<number[]>([])

  const { address } = useAccount()

  const getChallengesCreatedIdArray = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'getChallengesCreatedByCreator',
    args: [address as `0x${string}`],
  })

  useEffect(() => {
    if (getChallengesCreatedIdArray.data !== undefined) {
      const idArray = getChallengesCreatedIdArray.data
      const numberIdArray = idArray.map((bigIntValue) => Number(bigIntValue))
      const challengeCreatedIdArray = Array.from({ length: numberIdArray.length }, (_, index) => index).reverse()
      setChallengeCreatedIds(challengeCreatedIdArray)
    }
  }, [getChallengesCreatedIdArray.data])

  return (
    <div className='p-4'>
      <h2 className='font-bold text-lg'>Your created challenges</h2>
      <div className='grid grid-cols-3 gap-2'>
        {challengeCreatedIds.map((challengeId) => (
          <Card key={challengeId} challengeId={challengeId} />
        ))}
      </div>
    </div>
  )
}

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useReadContract, useReadContracts } from 'wagmi'
import { contractAddress, spiceUpAbi } from '@/utils/contractDetails'
import Card from './challenge-card'
import { useSmartAccount } from '../../components/Layout'

export default function Home() {
  const [challengeCount, setChallengeCount] = useState<number>()
  const [challengeIds, setChallengeIds] = useState<number[]>([])

  const smartAccount = useSmartAccount()

  const getChallengeCount = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'getChallengesCount',
  })

  useEffect(() => {
    if (getChallengeCount.data) {
      const count = Number(getChallengeCount.data)
      setChallengeCount(count)

      const challengeIdArray = Array.from(Array(count).keys()).reverse()
      setChallengeIds(challengeIdArray)
    }
  }, [getChallengeCount.data])

  return (
    <div className='p-8 ml-0'>
      <h1 className='font-bold text-xl'>All challenges</h1>
      <div className='grid grid-cols-3 gap-6'>
        {challengeIds.map((challengeId) => (
          <Card key={challengeId} challengeId={challengeId} smartAccount={smartAccount} />
        ))}
      </div>
    </div>
  )
}

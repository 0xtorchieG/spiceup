'use client'

import React, { useEffect, useState } from 'react'
import { useReadContract, useAccount } from 'wagmi'
import { contractAddress, spiceUpAbi } from '@/utils/contractDetails'
import { parseEther, formatEther } from 'viem'

interface ProfileStatsProps {
  address: `0x${string}`
  numberOfChallenges: number
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ address, numberOfChallenges }) => {
  const [prizeMoneyCollected, setPrizeMoneyCollected] = useState<number>()

  const claimedPrizes = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'claimedPrizesAmount',
    args: [address as `0x${string}`],
    // config,
  })

  useEffect(() => {
    if (claimedPrizes.data !== undefined) {
      setPrizeMoneyCollected(Number(formatEther(claimedPrizes.data)))
    }
  }, [claimedPrizes.data])

  return (
    <div className='grid grid-cols-6 gap-6'>
      <div className='stats shadow max-w-62 bg-base-300'>
        <div className='stat'>
          <div className='stat-title'>Total Prizes Won</div>
          <div className='stat-value'>
            {prizeMoneyCollected === undefined ? (
              <span className='loading loading-spinner loading-sm'></span>
            ) : (
              `${prizeMoneyCollected} $CHZ`
            )}
          </div>
        </div>
      </div>
      <div className='stats shadow max-w-62 bg-base-300'>
        <div className='stat'>
          <div className='stat-title'># challenges entered</div>
          <div className='stat-value'>
            {numberOfChallenges === undefined ? (
              <span className='loading loading-spinner loading-sm'></span>
            ) : (
              `${numberOfChallenges}`
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileStats

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useReadContract } from 'wagmi'
import { contractAddress, spiceUpAbi } from '@/utils/contractDetails'

const ChallengeDetails: React.FC<{ challengeId: number }> = (props) => {
  const { challengeId } = props
  const [topTenAddresses, setTopTenAddresses] = useState<readonly `0x${string}`[]>([])
  const [topTenScores, setTopTenAddressesScores] = useState<readonly bigint[]>([])

  const getChallengeLeaderboardById = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'getLeaderboard',
    args: [BigInt(challengeId)],
  })

  useEffect(() => {
    if (getChallengeLeaderboardById.data) {
      const [addresses, scores] = getChallengeLeaderboardById.data
      setTopTenAddresses(addresses)
      setTopTenAddressesScores(scores)
    }
  }, [getChallengeLeaderboardById.data])

  return (
    <>
      <details className='collapse collapse-arrow'>
        <div className='divider'>
          <summary className='collapse-title'>🏅 Stats 🏅 </summary>
        </div>
        <div className='collapse-content'>
          <h3 className='font-bold text-lg'>Top 10 participants</h3>
          <table className='table table-zebra'>
            {/* head */}
            <thead>
              <tr>
                <th>Position</th>
                <th>Address</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {/* Render rows dynamically */}
              {topTenAddresses.map((address, index) =>
                topTenScores[index].toString() !== '0' ? (
                  <tr key={address}>
                    <td>
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index + 1}
                    </td>
                    <td>
                      <Link href={`https://testnet.chiliscan.com/address/${address}`} target='_blank'>
                        {address.slice(0, 4) + '...' + address.slice(-5)}
                      </Link>
                    </td>
                    <td>{topTenScores[index].toString()}</td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        </div>
      </details>
    </>
  )
}

export default ChallengeDetails

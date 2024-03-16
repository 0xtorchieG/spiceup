'use client'

import React from 'react'
import Link from 'next/link'
import { type BaseError, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { contractAddress, spiceUpAbi } from '@/utils/contractDetails'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'

const ClaimPrize: React.FC<{ challengeId: number; position: number }> = (props) => {
  const { challengeId, position } = props

  const { data: hash, isPending, error, writeContract } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const claimPrize = async (challengeId: number) => {
    writeContract({
      address: contractAddress,
      abi: spiceUpAbi,
      functionName: 'claimPrize',
      args: [BigInt(challengeId)],
    })
  }

  return (
    <div className='mb-3'>
      <h2 className='font-bold text-lg'>🏆 Congrats! You won {position + 1}. place!</h2>
      <button className='btn btn-accent' onClick={() => claimPrize(challengeId)} disabled={isConfirmed || isConfirming}>
        {isPending ? <span className='loading loading-spinner loading-sm'></span> : 'Claim prize'}
      </button>
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
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && (
        <div>
          <Link href='/user-profile'>
            <div className='badge badge-outline bg-success'>
              <CheckCircleOutlinedIcon fontSize='small' />
              Prize claimed. Check profile stats.
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}

export default ClaimPrize

'use client'

import React, { useEffect, useState } from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { contractAddress, spiceUpAbi } from '@/utils/contractDetails'
import Link from 'next/link'
import { type BaseError, useAccount, useBalance, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'

export default function Home() {
  // Define state variables to store form input values
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [challengeType, setChallengeType] = useState('Run: Distance')
  const [minGoalValue, setMinGoalValue] = useState<number>()
  const [prizePool, setPrizePool] = useState<number>()
  const [tokenGating, setTokenGating] = useState<boolean>(false)
  const [tokenForGating, setTokenForGating] = useState('')
  const [formSubmitted, setFormSubmitted] = useState(false)

  const challengeTypes = ['Run: Distance', 'Run: Time', 'Heartrate']
  const challengeMetric = { 'Run: Distance': 'km', 'Run: Time': 'mins', Heartrate: 'bpm' }

  const { isConnected } = useAccount()

  const { data: hash, isPending, error, writeContract } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Function to handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Calculate the difference in seconds between start and end date times
    const startDateTime = new Date(startDate + 'T' + startTime)
    const endDateTime = new Date(endDate + 'T' + endTime)
    const diffSeconds = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000)
    const startDateTimeSeconds = startDateTime.getTime() / 1000

    let tokenAddressGating: `0x${string}` = tokenGating
      ? (tokenForGating as `0x${string}`)
      : ('0x0000000000000000000000000000000000000000' as `0x${string}`)

    const typeId = challengeTypes.indexOf(challengeType)

    const createParams: [string, bigint, bigint, bigint, `0x${string}`, number, boolean] = [
      title,
      BigInt(minGoalValue || 0), // Assuming minGoalValue is number or undefined
      BigInt(startDateTimeSeconds),
      BigInt(diffSeconds),
      tokenAddressGating, // Assuming tokenAddressGating is already a string
      typeId,
      tokenGating,
    ]

    // Convert the BigNumber object to a native bigint
    const valueToSend: bigint = prizePool ? parseEther(prizePool.toString()) : BigInt(0)

    writeContract({
      address: contractAddress,
      abi: spiceUpAbi,
      functionName: 'createChallenge',
      args: createParams,
      value: valueToSend,
    })

    setFormSubmitted(true)
  }

  // Reset the form when formSubmitted changes to true
  useEffect(() => {
    if (formSubmitted) {
      resetForm()
      setFormSubmitted(false) // Reset formSubmitted to false
    }
  }, [formSubmitted])

  // Function to reset all form fields
  const resetForm = () => {
    setStartDate('')
    setStartTime('')
    setEndDate('')
    setEndTime('')
    setChallengeType('')
    setMinGoalValue(undefined)
    setPrizePool(undefined)
    setTokenGating(false)
    setTokenForGating('')
  }

  return (
    <div className='p-10 h-full bg-gradient-to-br from-bg-primary to-neutral '>
      <div className='card w-100 glass'>
        <div className='card-body'>
          <h2 className='card-title'>Engage with your fans in new ways 🏃‍♀️🏋️‍♂️💪</h2>
          <p>Your fans need to show up, get up, spice up.</p>
          <p>Create challenges, token-gate them and reward your active fans.</p>
          <p>Your fans can get as ripped as their role models.</p>
          <div className='card-actions justify-end'>
            <button
              className='btn btn-secondary'
              onClick={() => document.getElementById('my_modal_5').showModal()}
              disabled={!isConnected}>
              {isConnected ? 'Create new challenge' : 'Connect your wallet to create challenge'}
            </button>
          </div>
        </div>
      </div>
      <dialog id='my_modal_5' className='modal modal-bottom lg:modal-middle'>
        <div className='modal-box'>
          <h3 className='font-bold text-lg mb-5'>Create New Challenge</h3>
          <form method='dialog' onSubmit={handleSubmit}>
            <div className='flex justify-start content-center h-10'>
              <label>
                Challenge Title:
                <input
                  type='text'
                  className='input input-bordered input-sm input-secondary ml-3 mr-3'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Challenge title'
                  required
                />
                {challengeType !== undefined && challengeMetric[challengeType]}
              </label>
            </div>
            <div className='flex justify-stretch content-center h-10'>
              <label className='justify-items-stretch'>
                Start Date:
                <input
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className='input input-bordered input-sm input-secondary ml-3 mr-3'
                  required
                />
              </label>
              <label className='justify-items-stretch'>
                Start Time:
                <input
                  type='time'
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className='input input-bordered input-sm input-secondary ml-3 mr-3'
                  required
                />
              </label>
            </div>
            <div className='flex justify-stretch content-center h-10'>
              <label className='justify-items-stretch'>
                End Date:
                <input
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className='input input-bordered input-sm input-secondary ml-3 mr-3'
                  required
                />
              </label>
              <label className='justify-items-stretch'>
                End Time:
                <input
                  type='time'
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className='input input-bordered input-sm input-secondary ml-3 mr-3'
                  required
                />
              </label>
            </div>
            <div className='flex justify-start content-center h-10'>
              <label>
                Challenge Type:
                <select
                  className='select select-secondary select-sm ml-3'
                  value={challengeType}
                  onChange={(e) => setChallengeType(e.target.value)}
                  required>
                  <option value='Run: Distance'>Run: Distance</option>
                  <option value='Run: Time'>Run: Time</option>
                  <option value='Heartrate'>Heartrate</option>
                </select>
              </label>
            </div>
            <div className='flex justify-start content-center h-10'>
              <label>
                Minimum for entering:
                <input
                  type='number'
                  className='input input-bordered input-sm input-secondary ml-3 mr-3'
                  value={minGoalValue}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    if (!isNaN(value) && value >= 0) {
                      setMinGoalValue(value)
                    }
                  }}
                  placeholder='100'
                  required
                />
                {challengeType !== undefined && challengeMetric[challengeType]}
              </label>
            </div>
            <div className='flex justify-start content-center h-10'>
              <label>
                Prize Pool
                <input
                  type='number'
                  value={prizePool}
                  onChange={(e) => {
                    const prize = parseInt(e.target.value)
                    if (!isNaN(prize) && prize >= 0) {
                      setPrizePool(prize)
                    }
                  }}
                  placeholder='1000'
                  className='input input-bordered input-sm input-secondary ml-3 mr-3'
                  required
                />
                $CHZ
              </label>
            </div>

            <div className='form-control flex justify-start'>
              <label className='label cursor-pointer flex justify-start'>
                <div
                  className='tooltip tooltip-right mr-2'
                  data-tip='By default there is no token gating, enable if you want to add token gating'>
                  <InfoOutlinedIcon />
                </div>
                <span className='label-text'>Enable Token Gating</span>
                <input
                  type='checkbox'
                  className='toggle toggle-secondary toggle-sm ml-3'
                  checked={tokenGating}
                  onChange={(e) => setTokenGating(e.target.checked)}
                />
              </label>
            </div>
            {tokenGating && (
              <label className='input input-bordered flex items-center gap-2'>
                Token address:
                <input
                  type='text'
                  className='grow'
                  placeholder='0x...'
                  value={tokenForGating}
                  onChange={(e) => setTokenForGating(e.target.value)}
                  required={tokenGating}
                />
              </label>
            )}
            <div className='modal-action'>
              <button type='submit' className='btn' disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Contract'}
              </button>
              <button
                onClick={() => {
                  document.getElementById('my_modal_5').close()
                  resetForm()
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
                  <span>😵‍💫 Error: {(error as BaseError).shortMessage || error.message}</span>
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
                    <Link href={`https://testnet.chiliscan.com/tx/${hash}`} target='_blank'>
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
      </dialog>
    </div>
  )
}

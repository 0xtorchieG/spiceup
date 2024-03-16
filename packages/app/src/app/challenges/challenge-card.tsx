'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { type BaseError, useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { contractAddress, spiceUpAbi } from '@/utils/contractDetails'
import { erc20Abi, fanTokenAbi } from '@/utils/fanTokens'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import LockPersonIcon from '@mui/icons-material/LockPerson'
import ChallengeDetails from './challenge-details'

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
}

const Card: React.FC<CardProps> = ({ challengeId }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [challengeLiveChecker, setChallengeLiveChecker] = useState<boolean>(false)
  const [hasEntered, setHasEntered] = useState<boolean>(false)
  const [buttonLabel, setButtonLabel] = useState<string>('')
  const [tokenForGating, setTokenForGating] = useState<string>()
  const [ownsGatingToken, setOwnsGatingToken] = useState<boolean>(false)
  const [imageURL, setImageURL] = useState<string>('')

  const challengeTypes = ['Run: Distance', 'Run: Time', 'Heartrate']
  const challengeMetric = { 'Run: Distance': 'km', 'Run: Time': 'mins', Heartrate: 'bpm' }

  const { address } = useAccount()
  const { data: hash, isPending, error, writeContract } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const getChallengeById = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'challenges',
    args: [BigInt(challengeId)],
  })

  const hasEnteredChallenge = useReadContract({
    abi: spiceUpAbi,
    address: contractAddress,
    functionName: 'participantEntered',
    args: [BigInt(challengeId), address as `0x${string}`],
  })

  const hasBalance = useReadContract({
    address: tokenForGating as `0x${string}`,
    abi: fanTokenAbi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  })

  const enterChallenge = async (challengeId: number) => {
    writeContract({
      address: contractAddress,
      abi: spiceUpAbi,
      functionName: 'enterChallenge',
      args: [BigInt(challengeId)],
    })
  }

  const formatTimestamp = (timestamp: bigint): string => {
    const milliseconds = Number(timestamp) * 1000
    const date = new Date(milliseconds)

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(2)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    const formattedDate = `${day}/${month}/${year}`
    const formattedTime = `${hours}:${minutes}`

    return `${formattedDate} ${formattedTime}`
  }

  const checkChallengeLive = (startTime: bigint, endTime: bigint): boolean => {
    const currentTime = Math.floor(Date.now() / 1000)
    if (startTime > currentTime) {
      setButtonLabel('Not yet started')
      return false
    }
    if (currentTime > endTime) {
      setButtonLabel('Challenge finished')
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

      if (challenge.tokenGateEnabled) {
        setTokenForGating(challenge.tokenAddress)
      }

      // Set the state with the array containing the challenge
      setChallenges([challenge])
      setChallengeLiveChecker(checkChallengeLive(challenge.startTime, challenge.endTime))
      setImageURL(getImageURL(challengeId, challenge.challengeType))
    }
  }, [getChallengeById.data])

  useEffect(() => {
    if (hasEnteredChallenge.data !== undefined) {
      const entered = hasEnteredChallenge.data
      setHasEntered(entered)
    }
  }, [hasEnteredChallenge.data])

  useEffect(() => {
    if (hasBalance.data !== undefined) {
      if (Number(hasBalance.data) > 0) {
        setOwnsGatingToken(true)
      }
    }
  }, [hasBalance.data])

  return (
    <div>
      {challenges.map((challenge) => (
        <div key={challenge.id} className='card w-84 bg-base-300 shadow-xl'>
          <figure className='p-5 h-250'>
            <Image
              src={imageURL}
              alt='Cover image for challenge card'
              width={200}
              height={200}
              className='rounded-md'
            />
          </figure>
          <div className='card-body mt-0 pt-0'>
            <h2 className='card-title text-md'>{challenge.title}</h2>
            <div className='grid grid-cols-2 gap-y-2 content-center'>
              <div className='grid grid-cols-1'>
                Type:
                <div className='badge badge-outline'>{challengeTypes[challenge.challengeType]}</div>
              </div>
              <div className='grid grid-cols-1'>
                Min. entry:
                <div className='badge badge-outline'>
                  {challenge.goalValue.toString()}{' '}
                  {challengeMetric[challengeTypes[challenge.challengeType] as keyof typeof challengeMetric]}
                </div>
              </div>
              <div className='grid grid-cols-1'>
                Start:
                <div className='badge badge-outline'>
                  {formatTimestamp(challenge.startTime).toString().slice(0, 17)}
                </div>
              </div>
              <div className='grid grid-cols-1'>
                End:
                <div className='badge badge-outline'>{formatTimestamp(challenge.endTime).toString().slice(0, 17)}</div>
              </div>
              <div className='grid grid-cols-1'>
                Creator:
                <div className='badge badge-outline'>
                  <Link href={`https://testnet.chiliscan.com/address/${challenge.creator}`} target='_blank'>
                    {challenge.creator.slice(0, 4) + '...' + challenge.creator.slice(-5)}
                  </Link>
                </div>
              </div>
              <div className='grid grid-cols-1'>
                Token-Gated:
                {challenge.tokenGateEnabled ? (
                  <Link href={`https://testnet.chiliscan.com/address/${challenge.tokenAddress}`} target='_blank'>
                    <div className='badge badge-outline badge-neutral badge-lg'>
                      <div
                        className='tooltip'
                        data-tip={`Requires holding of ${challenge.tokenAddress.slice(0, 10) + '...' + challenge.tokenAddress.slice(-10)}`}>
                        {ownsGatingToken ? (
                          <div className='text-success content-center'>
                            <LockOpenIcon fontSize='small' color='success' />
                            Unlocked
                          </div>
                        ) : (
                          <div className='text-error'>
                            <LockPersonIcon fontSize='small' color='error' />
                            Locked
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className='badge badge-outline badge-secondary badge-lg'>
                    <LockOpenIcon fontSize='small' />
                    Open
                  </div>
                )}
              </div>
            </div>
            <div className='card-actions w-full justify-end'>
              {hasEntered || isConfirmed ? (
                <Link href='/user-profile'>
                  <button className='btn btn-accent' disabled={!hasEntered || !challengeLiveChecker}>
                    {!challengeLiveChecker ? buttonLabel : 'Log data'}
                  </button>
                </Link>
              ) : (
                <button
                  className='btn btn-primary'
                  disabled={
                    !challengeLiveChecker || (challenge.tokenGateEnabled && ownsGatingToken !== true) || isConfirmed
                  }
                  onClick={() => enterChallenge(challengeId)}>
                  {isPending ? <span className='loading loading-spinner loading-sm'></span> : ''}
                  {!challengeLiveChecker && !isConfirming && !isConfirmed ? buttonLabel : 'Enter Challenge'}
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
                      <span> Error: {(error as BaseError).shortMessage || error.message}</span>
                    </div>
                  )}
                  {isConfirming && (
                    <div>
                      <span className='loading loading-spinner loading-sm'></span> Entering...
                    </div>
                  )}
                </button>
              )}
            </div>
            <div>
              {buttonLabel !== 'Not yet started' ? (
                <ChallengeDetails challengeId={challengeId} challengeLive={challengeLiveChecker} />
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Card

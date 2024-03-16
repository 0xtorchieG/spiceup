import React from 'react'
import { SITE_DESCRIPTION } from '@/utils/site'
import { NetworkStatus } from './NetworkStatus'

export function Footer() {
  return (
    <>
      <footer className='sticky top-[100vh] footer flex justify-end items-center bg-neutral text-neutral-content p-4'>
        <p>{SITE_DESCRIPTION} Built with love for a sporty lifestyle</p>
        <NetworkStatus />
        <div className='flex gap-4'></div>
      </footer>
    </>
  )
}

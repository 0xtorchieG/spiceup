'use client'

import React from 'react'
import { DynamicWidget } from '@dynamic-labs/sdk-react-core'

export function Header() {
  return (
    <header className='navbar sticky flex bg-neutral justify-end h-10 p-4'>
      <DynamicWidget />
    </header>
  )
}

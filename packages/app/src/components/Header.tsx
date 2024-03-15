import React from 'react'
import { Connect } from './Connect'

export function Header() {
  return (
    <header className='navbar sticky flex bg-neutral justify-end h-10 p-4'>
      <Connect />
    </header>
  )
}

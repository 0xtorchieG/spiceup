import React from 'react'

export function ThemeToggle() {
  return (
    <div className='grid grid-cols-2 gap-3 mx-auto'>
      <button className='btn btn-square'>
        <input
          type='radio'
          name='theme-buttons'
          className='btn theme-controller text-lg'
          aria-label='🌚'
          value='night'
        />
      </button>
      <button className='btn btn-square'>
        <input
          type='radio'
          name='theme-buttons'
          className='btn theme-controller text-lg'
          aria-label='🌤'
          value='acid'
        />
      </button>
    </div>
  )
}

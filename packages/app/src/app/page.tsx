import React from 'react'
import Link from 'next/link'

export default function Home() {

  return (
    <>
      <div className='hero w-full min-h-screen bg-base-100'>
        <div className='hero-content w-full flex-col lg:flex-row'>
          <img
            src='/images/hero_image_spiceup.png'
            alt='SpiceUp Hero Image'
            className='max-w-sm rounded-lg shadow-2xl'
          />
          <div>
            <h1 className='text-5xl font-bold'>Get up! Show up! Spice up!</h1>
            <p className='py-6'>
              Join your favorite sport clubs&apos; challenges in getting the fanbase more active and healthy. <br />
              Level up yourself! <br />
              Win the championships and earn CHZ tokens.
            </p>
            <Link href='/user-profile'>
              <button className='btn btn-primary mr-4'>Get active</button>
            </Link>
            <Link href='/challenges'>
              <button className='btn btn-primary'>Check challenges</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

import React, { PropsWithChildren } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import Link from 'next/link'
import SportsSoccerOutlinedIcon from '@mui/icons-material/SportsSoccerOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined'
import { ThemeToggle } from './ThemeToggle'

export function Layout(props: PropsWithChildren) {
  return (
    <div className='flex flex-col min-h-screen bg-base-200'>
      <div className='drawer lg:drawer-open z-30'>
        <input id='my-drawer-2' type='checkbox' className='drawer-toggle' />
        <div className='drawer-content flex flex-col items-center justify-center'>
          <Header />
          <main className='flex-grow container mx-auto ml-0'>{props.children}</main>
          <label htmlFor='my-drawer-2' className='btn btn-primary drawer-button lg:hidden'>
            Open drawer
          </label>
        </div>
        <div className='drawer-side bg-neutral'>
          <label htmlFor='my-drawer-2' aria-label='close sidebar' className='drawer-overlay'></label>
          <Link href='/'>
            <h1 className='text-xl font-bold pl-6 pt-4 h-16 text-white'>SpiceUp</h1>
          </Link>

          <ul className='menu p-4 w-56 min-h-full bg-base-300 text-base-content'>
            <li className='mt-4 mb-4'>
              <Link href='/challenges'>
                <WorkspacePremiumOutlinedIcon />
                <p>Challenges</p>
              </Link>
            </li>
            <li className='mb-4'>
              <Link href='/user-profile'>
                <AccountBoxOutlinedIcon />
                <p>Your profile</p>
              </Link>
            </li>
            <li>
              <Link href='/clubs-area'>
                <SportsSoccerOutlinedIcon />
                <p>Clubs area</p>
              </Link>
            </li>
            <div className='divider'>Toggle theme</div>
            <ThemeToggle />
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  )
}

'use client'

import React, { createContext, PropsWithChildren, useContext, useState, useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import Link from 'next/link'
import SportsSoccerOutlinedIcon from '@mui/icons-material/SportsSoccerOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined'
import { ThemeToggle } from './ThemeToggle'
import { createSmartAccount } from '@/utils/biconomy'
import { useUserWallets } from '@dynamic-labs/sdk-react-core'
import { ChainId } from '@biconomy/core-types'

const SmartAccountContext = createContext<any>(null)

export const useSmartAccount = () => useContext(SmartAccountContext)

export function Layout(props: PropsWithChildren) {
  const [provider, setProvider] = useState<any>()
  const [signer, setSigner] = useState<any>()
  const [smartAccount, setSmartAccount] = useState<any>()

  const userWallets = useUserWallets()

  useEffect(() => {
    const fetchClients = async (embeddedWallet: any) => {
      if (embeddedWallet.chain !== ChainId.CHILIZ_TESTNET) {
        await embeddedWallet.connector.switchNetwork({
          networkChainId: ChainId.CHILIZ_TESTNET,
        })
      }

      const newProvider = await embeddedWallet.connector?.getPublicClient()
      const newSigner = await embeddedWallet.connector?.ethers?.getSigner()

      setProvider(newProvider)
      setSigner(newSigner)

      return
    }

    if (userWallets.length > 0 && (!provider || !signer)) {
      const embeddedWallet = userWallets.find((wallet) => wallet?.connector?.isEmbeddedWallet === true)

      if (embeddedWallet) {
        fetchClients(embeddedWallet)
      }
    }
  }, [userWallets, provider, signer])

  useEffect(() => {
    const createAndSetSmartAccount = async () => {
      const newSmartAccount = await createSmartAccount(provider, signer)
      console.log(newSmartAccount)
      setSmartAccount(newSmartAccount)
    }

    if (provider && signer && !smartAccount) {
      createAndSetSmartAccount()
    }
  }, [provider, signer, smartAccount])

  return (
    <SmartAccountContext.Provider value={smartAccount}>
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
    </SmartAccountContext.Provider>
  )
}

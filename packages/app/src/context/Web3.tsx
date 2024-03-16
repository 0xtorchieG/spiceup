'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { State, WagmiProvider, createConfig } from 'wagmi'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { EthersExtension } from '@dynamic-labs/ethers-v6'
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector'
import { http } from 'viem'
import { spicy } from 'viem/chains'

interface Props extends PropsWithChildren {
  initialState?: State
}

const environmentId = '6f762db0-8050-4fc9-b282-9a3d00d39197'

const queryClient = new QueryClient()

const config = createConfig({
  chains: [spicy],
  multiInjectedProviderDiscovery: false,
  transports: {
    [spicy.id]: http('https://spicy-rpc.chiliz.com'),
  },
})

const evmNetworks = [
  {
    blockExplorerUrls: ['https://testnet.chiliscan.com/'],
    chainId: 88882,
    chainName: 'Chiliz Spicy Testnet',
    iconUrls: ['/images/chiliz_logo.svg'],
    name: 'Chiliz Spicy Testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'CHZ',
      symbol: 'CHZ',
    },
    networkId: 88882,
    rpcUrls: ['https://spicy-rpc.chiliz.com'],
    vanityName: 'Chiliz Spicy Testnet',
  },
]

export function Web3Provider(props: Props) {
  return (
    <>
      <DynamicContextProvider
        theme='dark'
        settings={{
          environmentId,
          walletConnectors: [EthereumWalletConnectors],
          walletConnectorExtensions: [EthersExtension],
          overrides: {
            evmNetworks,
          },
        }}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <DynamicWagmiConnector>{props.children}</DynamicWagmiConnector>
          </QueryClientProvider>
        </WagmiProvider>
      </DynamicContextProvider>
    </>
  )
}

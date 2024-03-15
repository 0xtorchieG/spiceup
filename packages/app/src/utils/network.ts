import {spicy, arbitrum, Chain } from 'viem/chains'

let chains = [spicy, arbitrum] as [Chain, ...Chain[]]


export const ETH_CHAINS = chains

export function GetNetworkColor(chain?: string) {
  if (chain === 'arbitrum') return 'blue'
  if (chain === 'spicy') return 'red'

  return 'grey'
}

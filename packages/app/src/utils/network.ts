import { spicy, arbitrum, Chain } from 'viem/chains'

let chains = [spicy] as [Chain, ...Chain[]]

export const ETH_CHAINS = chains

export function GetNetworkColor(chain?: string) {
  if (chain === 'spicy') return 'red'

  return 'grey'
}

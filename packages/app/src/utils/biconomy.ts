import { Bundler } from '@biconomy/bundler'
import { BiconomyPaymaster } from '@biconomy/paymaster'
import { ChainId } from '@biconomy/core-types'
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from '@biconomy/modules'
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account'
import { ethers } from 'ethers'

const bundler = new Bundler({
  bundlerUrl: 'https://bundler.biconomy.io/api/v2/88882/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',
  chainId: ChainId.CHILIZ_TESTNET, // Replace this with your desired network
  entryPointAddress: '0x00000061FEfce24A79343c27127435286BB7A4E1', // This is a Biconomy constant
})

const paymaster = new BiconomyPaymaster({
  paymasterUrl: 'https://paymaster.biconomy.io/api/v1/88882/m_MKZT0IL.ab477ee5-6d3c-4f69-9dc7-3604ba3afa84',
})

// const paymaster: IPaymaster = await createPaymaster({
//   paymasterUrl: 'https://paymaster.biconomy.io/api/v1/88882/m_MKZT0IL.ab477ee5-6d3c-4f69-9dc7-3604ba3afa84', // <-- Read about at https://docs.biconomy.io/dashboard/paymaster
//   strictMode: true,
// })

const createValidationModule = async (signer: any) => {
  return await ECDSAOwnershipValidationModule.create({
    signer: signer,
    moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE, // This is a Biconomy constant
  })
}

export const createSmartAccount = async (provider: any, signer: any) => {
  const validationModule = await createValidationModule(signer)

  return await BiconomySmartAccountV2.create({
    chainId: ChainId.CHILIZ_TESTNET, // Replace this with your target network
    bundler: bundler, // Use the `bundler` we initialized above
    paymaster: paymaster, // Use the `paymaster` we initialized above
    entryPointAddress: '0x00000061FEfce24A79343c27127435286BB7A4E1', // This is a Biconomy constant
    defaultValidationModule: validationModule, // Use the `validationModule` we initialized above
    activeValidationModule: validationModule, // Use the `validationModule` we initialized above
  })
}

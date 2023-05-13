import React, { useEffect, useState } from 'react'
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite } from '~~/hooks/scaffold-eth'
import { Spinner } from '@chakra-ui/react'
import AccessoryList from './AccessoryList'
import { useAccount, useProvider } from 'wagmi'
import { ethers } from 'ethers'

type Props = {name: string, icon: string | JSX.Element}

const AccessoryUI = ({name, icon, className}: Props) => {
    const [balance, setBalance] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)

    const {address: connectedAccount, isConnected} = useAccount()

    const {data: userBalance, isLoading: isLoadingUserBalance} = useScaffoldContractRead({
      contractName: name,
      functionName: "balanceOf",
      args: [connectedAccount]
    })
  
    const {writeAsync: mint, isLoading: isMinting, isSuccess: isMinted} = useScaffoldContractWrite({
      contractName: name,
      functionName: "mint",
      overrides: {
        value: ethers.utils.parseEther("0.01"),
        gasLimit: ethers.BigNumber.from("500000"),
      },
      onSuccess: () => {
          setBalance(balance + 1)
      }
    })


  const provider = useProvider()
  const {data: accessoryContract, isLoading: isLoadingAccessoryContract} = useDeployedContractInfo(name)
  
  useEffect(() => {
    (async () => {
      if(!isConnected || isLoadingAccessoryContract) return 

      setIsLoading(true)
      
      const accessory = new ethers.Contract(accessoryContract?.address, accessoryContract.abi, provider)
      const balance = (await accessory.balanceOf(connectedAccount)).toNumber()

      setBalance(balance)
      setIsLoading(false)
    })()
  }, [isLoadingAccessoryContract, isConnected, connectedAccount, name])

  return (
    <main className={`flex flex-col items-center gap-4 px-4 py-8 ${className}`}>
      <h2 className="text-[1.8rem] md:text-[2.5rem] text-center h-16 md:h-20">Get a <strong className="text-orange-500">{name}{icon}</strong> for your Snowman☃️</h2>
      <p className="text-md md:text-xl -mt-2 text-center max-w-lg">Mint a unique {name}{icon} for 0.01 ETH and add to your Snowman☃️</p>
      <button className="border-orange-500 bg-orange-500 hover:border-black hover:bg-white hover:text-black transition-all px-4 py-2 text-white rounded-md shadow-lg" onClick={mint} disabled={isMinting}>{isMinting? <Spinner size="md" thickness='4px' speed='0.65s' />: "Mint One"}</button>

      {!isLoading? (<AccessoryList name={name} icon={icon} balance={balance} />): <Spinner size="md" thickness='4px' speed='0.65s' className="mt-10" />}
    </main>
  )
}

export default AccessoryUI
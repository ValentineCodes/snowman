import React, { useEffect, useState } from 'react'
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite } from '~~/hooks/scaffold-eth'
import { Spinner } from '@chakra-ui/react'
import AccessoryList from './AccessoryList'
import { useAccount, useProvider, useSigner } from 'wagmi'
import { ethers } from 'ethers'
import { notification } from '~~/utils/scaffold-eth'

type Props = {name: string, icon: string | JSX.Element}

const AccessoryUI = ({name, icon}: Props) => {
    const [balance, setBalance] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isMinting, setIsMinting] = useState(false)

    const {address: connectedAccount, isConnected} = useAccount()
    const {data: signer, isLoading: isLoadingSigner} = useSigner()
  
    const provider = useProvider()
    const {data: accessoryContract, isLoading: isLoadingAccessoryContract} = useDeployedContractInfo(name)

    const handleMint = async () => {
      if(isLoadingAccessoryContract || isLoadingSigner) return

      const accessory = new ethers.Contract(accessoryContract.address, accessoryContract.abi, signer)
      setIsMinting(true)
      try {

        notification.loading(`Minting One(1) ${name}`)
        const tx = await accessory.mint({
          value: ethers.utils.parseEther("0.01"),
          gasLimit: ethers.BigNumber.from("500000"),
        })
        await tx.wait(1)
        
        notification.success(`Minted One(1) ${name}`)
        setBalance(balance + 1)
      } catch(error) {
        notification.error(JSON.stringify(error))
      }
      setIsMinting(false)
    }
  
    useEffect(() => {
      (async () => {
        if(!isConnected || isLoadingAccessoryContract) return 

        setIsLoading(true)
        setIsMinting(false)
        
        const accessory = new ethers.Contract(accessoryContract?.address, accessoryContract.abi, provider)
        const balance = (await accessory.balanceOf(connectedAccount)).toNumber()

        setBalance(balance)
        setIsLoading(false)
      })()
    }, [isLoadingAccessoryContract, isConnected, connectedAccount, name])

    return (
      <main className="flex flex-col items-center gap-4 px-4 py-8">
        <h2 className="text-[1.8rem] md:text-[2.5rem] text-center h-16 md:h-20">Get a <strong className="text-orange-500">{name}{icon}</strong> for your Snowman☃️</h2>
        <p className="text-md md:text-xl -mt-2 text-center max-w-lg">Mint a unique {name}{icon} for 0.01 ETH and add to your Snowman☃️</p>
        <button className="border-orange-500 bg-orange-500 hover:border-black hover:bg-white hover:text-black transition-all px-4 py-2 text-white rounded-md shadow-lg" onClick={handleMint} disabled={isMinting}>{isMinting? <Spinner size="md" thickness='4px' speed='0.65s' />: "Mint One"}</button>

        {!isLoading? (<AccessoryList name={name} icon={icon} balance={balance} />): <Spinner size="md" thickness='4px' speed='0.65s' className="mt-10" />}
      </main>
    )
}

export default AccessoryUI
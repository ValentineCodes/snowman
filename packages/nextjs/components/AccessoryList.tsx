import React, {useState, useEffect} from 'react'

import Accessory from './cards/Accessory'
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth'
import { useAccount, useProvider } from 'wagmi'
import {ethers} from "ethers"
import {Spinner} from "@chakra-ui/react"

type Props = {balance: number}

const AccessoryList = ({balance}: Props) => {
    const [accessories, setAccessories] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)

  const {address: connectedAccount, isConnected} = useAccount()
  const provider = useProvider()

    const {data: accessoryContract, isLoading: isLoadingAccessoryContract} = useDeployedContractInfo("Hat")

    useEffect(() => { 
      if(isLoadingAccessoryContract || !isConnected) return
      
      (async () => {
        setIsLoading(true)
        const accessory = new ethers.Contract(accessoryContract.address, accessoryContract.abi, provider)
        const tokenURIs = [];
        for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
          try {
            const tokenId = await accessory.tokenOfOwnerByIndex(connectedAccount, tokenIndex);
            const tokenURI = await accessory.tokenURI(tokenId);
            const metadata = await (await fetch(tokenURI)).json()
            metadata.image = await (await fetch(metadata.image)).text()
            tokenURIs.push({ id: tokenId, ...metadata});
          } catch(error) {
            console.error(error)
          }
        }
        setAccessories(tokenURIs)
        setIsLoading(false)
      })()
    }, [balance, isLoadingAccessoryContract])

    const renderAccessoryList = () => {
      if(!accessories && isLoading) return <Spinner size="md" thickness='4px' speed='0.65s' className="mt-10" />

      if(!accessories || accessories.length === 0) return

      return accessories.map(accessory => (<Accessory key={accessory.id} name={accessory.name} description={accessory.description} image={accessory.image} />))
    }

  return (
    <section className='flex flex-col items-center'>
      <p className="text-xl text-center">You own <strong>{balance || "No"}</strong> Hat🎩</p>

      <div className="flex flex-wrap justify-center items-center gap-5 my-10">
        {renderAccessoryList()}
      </div>
    </section>
  )
}

export default AccessoryList
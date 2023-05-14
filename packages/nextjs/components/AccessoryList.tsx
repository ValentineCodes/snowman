import React, {useState, useEffect} from 'react'

import Accessory from './cards/Accessory'
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth'
import { useAccount, useProvider } from 'wagmi'
import {ethers} from "ethers"
import {Spinner} from "@chakra-ui/react"

type Props = {name: string, icon: string | JSX.Element, balance: number}

const AccessoryList = ({name, icon, balance}: Props) => {
    const [userBalance, setUserBalance] = useState(balance)
    const [accessories, setAccessories] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)

  const {address: connectedAccount, isConnected} = useAccount()
  const provider = useProvider()

    const {data: accessoryContract, isLoading: isLoadingAccessoryContract} = useDeployedContractInfo(name)

    useEffect(() => { 
      if(isLoadingAccessoryContract || !isConnected) return
      
      (async () => {
        setIsLoading(true)
        setUserBalance(balance)
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
    }, [balance, isLoadingAccessoryContract, name])

    const renderAccessoryList = () => {
      if(isLoading) return <Spinner size="md" thickness='4px' speed='0.65s' className="mt-10" />

      if(!accessories || accessories.length === 0) return

      return accessories.map(accessory => {
        const remove = () => {
          setAccessories(accessories => accessories?.filter(_accessory => _accessory.id.toNumber() !== accessory.id.toNumber()))
          setUserBalance(balance - 1)
        }
        return <Accessory key={accessory.id} id={accessory.id} contractName={name} name={accessory.name} description={accessory.description} image={accessory.image} remove={remove} />
      })
    }

  return (
    <section className='flex flex-col items-center'>
      <p className="text-xl text-center">You own <strong>{userBalance || "No"}</strong> {name}{icon}</p>

      <div className="flex flex-wrap justify-center items-center gap-5 my-10">
        {renderAccessoryList()}
      </div>
    </section>
  )
}

export default AccessoryList
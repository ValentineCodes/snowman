import React, {useState, useEffect} from 'react'

import Snowman from './cards/Snowman'
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth'
import { useAccount, useProvider } from 'wagmi'
import {ethers} from "ethers"
import {Spinner} from "@chakra-ui/react"

type Props = {balance: number}

const SnowmanList = ({balance}: Props) => {
    const [snowmen, setSnowmen] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)

  const {address: connectedAccount, isConnected} = useAccount()
  const provider = useProvider()

    const {data: snowmanContract, isLoading: isLoadingSnowmanContract} = useDeployedContractInfo("Snowman")

    useEffect(() => { 
      if(isLoadingSnowmanContract || !isConnected) return
      
      (async () => {
        setIsLoading(true)
        const snowman = new ethers.Contract(snowmanContract.address, snowmanContract.abi, provider)
        const tokenURIs = [];
        for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
          try {
            const tokenId = await snowman.tokenOfOwnerByIndex(connectedAccount, tokenIndex);
            const tokenURI = await snowman.tokenURI(tokenId);
            const metadata = await (await fetch(tokenURI)).json()
            metadata.image = await (await fetch(metadata.image)).text()
            tokenURIs.push({ id: tokenId, ...metadata});
          } catch(error) {
            console.error(error)
          }
        }
        setSnowmen(tokenURIs)
        setIsLoading(false)
      })()
    }, [balance, isLoadingSnowmanContract])

    const renderSnowmanList = () => {
      if(!snowmen && isLoading) return <Spinner size="md" thickness='4px' speed='0.65s' className="mt-10" />

      if(!snowmen || snowmen.length === 0) return

      return snowmen.map(snowman => (<Snowman key={snowman.id} name={snowman.name} description={snowman.description} image={snowman.image} />))
    }

  return (
    <section className='flex flex-col items-center'>
      <p className="text-xl text-center">You own <strong>{balance || "No"}</strong> Snowman☃️</p>

      <div className="flex flex-wrap justify-center items-center gap-5 my-10">
        {renderSnowmanList()}
      </div>
    </section>
  )
}

export default SnowmanList
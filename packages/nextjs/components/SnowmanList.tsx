import React, {useState, useEffect} from 'react'

import Snowman from './cards/Snowman'
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth'
import { useAccount, useProvider } from 'wagmi'
import {ethers} from "ethers"
import {Spinner} from "@chakra-ui/react"

type Props = {balance: number}

const SnowmanList = ({balance}: Props) => {
    const [userBalance, setUserBalance] = useState(balance)
    const [snowmen, setSnowmen] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)

  const {address: connectedAccount, isConnected} = useAccount()
  const provider = useProvider()

    const {data: snowmanContract, isLoading: isLoadingSnowmanContract} = useDeployedContractInfo("Snowman")

    useEffect(() => { 
      if(isLoadingSnowmanContract || !isConnected) return
      
      (async () => {
        setIsLoading(true)
        setUserBalance(balance)
        const snowman = new ethers.Contract(snowmanContract.address, snowmanContract.abi, provider)
        const tokenIds = [];
        for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
          try {
            const tokenId = await snowman.tokenOfOwnerByIndex(connectedAccount, tokenIndex);
            tokenIds.push({ id: tokenId});
          } catch(error) {
            console.error(error)
          }
        }
        setSnowmen(tokenIds)
        setIsLoading(false)
      })()
    }, [balance, isLoadingSnowmanContract])



    const renderSnowmanList = () => {
      if(!snowmen && isLoading) return <Spinner size="md" thickness='4px' speed='0.65s' className="mt-10" />

      if(!snowmen || snowmen.length === 0) return

      return snowmen.map(snowman => {
        const remove = () => {
          setSnowmen(snowmen => snowmen?.filter(_snowman => _snowman.id.toNumber() !== snowman.id.toNumber()))
          setUserBalance(balance - 1)
        }
        return <Snowman key={snowman.id} id={snowman.id} remove={remove} />
      })
    }

  return (
    <section className='flex flex-col items-center'>
      <p className="text-xl text-center">You own <strong>{userBalance || "No"}</strong> Snowman☃️</p>

      <div className="flex flex-wrap justify-center items-center gap-5 my-10">
        {renderSnowmanList()}
      </div>
    </section>
  )
}

export default SnowmanList
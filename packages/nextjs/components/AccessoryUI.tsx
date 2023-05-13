import React, { useEffect, useState } from 'react'
import { useScaffoldContractRead, useScaffoldContractWrite } from '~~/hooks/scaffold-eth'
import { Spinner } from '@chakra-ui/react'
import AccessoryList from './AccessoryList'
import { useAccount } from 'wagmi'

type Props = {}

const AccessoryUI = (props: Props) => {
    const [balance, setBalance] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)

    const {address: connectedAccount, isConnected} = useAccount()

    const {data: userBalance, isLoading: isLoadingUserBalance} = useScaffoldContractRead({
      contractName: "Hat",
      functionName: "balanceOf",
      args: [connectedAccount]
    })
  
    const {writeAsync: mint, isLoading: isMinting, isSuccess: isMinted} = useScaffoldContractWrite({
      contractName: "Hat",
      functionName: "mint",
      value: "0.01",
      gasLimit: 500000,
      onSuccess: () => {
          setBalance(balance + 1)
      }
    })
  
    useEffect(() => {
      if(!isConnected || isLoadingUserBalance) return 
  
      const balance = userBalance && userBalance.toNumber && userBalance.toNumber()
      console.log("Balance: ", balance)
      setBalance(balance)
      setIsLoading(false)
  
    }, [isConnected, connectedAccount])

  return (
    <main className='flex flex-col items-center gap-4 px-4 py-12'>
      <h2 className="text-[1.8rem] md:text-[2.5rem] text-center h-16 md:h-20">Get a <strong className="text-orange-500">Hat🎩</strong> for your Snowman☃️</h2>
      <p className="text-md md:text-xl -mt-2 text-center max-w-lg">Mint a unique Hat🎩 for 0.01 ETH and add to your Snowman☃️</p>
      <button className="border-orange-500 bg-orange-500 hover:border-black hover:bg-white hover:text-black transition-all px-4 py-2 text-white rounded-md shadow-lg" onClick={mint} disabled={isMinting}>{isMinting? <Spinner size="md" thickness='4px' speed='0.65s' />: "Mint One"}</button>

      {!isLoading? (<AccessoryList balance={balance} />): <Spinner size="md" thickness='4px' speed='0.65s' className="mt-10" />}
    </main>
  )
}

export default AccessoryUI
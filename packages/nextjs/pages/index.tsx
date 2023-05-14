import React, {useState, useEffect} from "react";
import Head from "next/head";
import type { NextPage } from "next";
import Link from "next/link";

import { Spinner } from '@chakra-ui/react'
import { useTypewriter } from 'react-simple-typewriter'
import { useAccount, useProvider, useSigner } from "wagmi";
import { ethers } from "ethers";

import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import SnowmanList from "~~/components/SnowmanList";
import { notification } from "~~/utils/scaffold-eth";


const Home: NextPage = () => {
  const [animatedText] = useTypewriter({
    words: ['Snowman?☃️', 'Half-Assed Olaf?🫡'],
    loop: 0,
    delaySpeed: 2500
  })

  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isMinting, setIsMinting] = useState(false)

  const {address: connectedAccount, isConnected} = useAccount()

  const provider = useProvider()
  const {data: signer, isLoading: isLoadingSigner} = useSigner()
  const {data: snowmanContract, isLoading: isLoadingSnowmanContract} = useDeployedContractInfo("Snowman")

  const handleMint = async () => {
    if(isLoadingSnowmanContract || isLoadingSigner) return

    const snowman = new ethers.Contract(snowmanContract.address, snowmanContract.abi, signer)
    try {
      setIsMinting(true)

      notification.loading("Minting One(1) Snowman☃️")
      const tx = await snowman.mint({
        value: ethers.utils.parseEther("0.02"),
        gasLimit: ethers.BigNumber.from("500000"),
      })
      await tx.wait(1)
      
      notification.success("Minted One(1) Snowman☃️")
      setBalance(balance + 1)
      setIsMinting(false)
    } catch(error) {
      setIsMinting(false)
      notification.error(JSON.stringify(error))
    }
  }
  
  useEffect(() => {
    (async () => {
      if(!isConnected || isLoadingSnowmanContract) return 

      setIsLoading(true)

      const snowman = new ethers.Contract(snowmanContract?.address, snowmanContract.abi, provider)
      const balance = (await snowman.balanceOf(connectedAccount)).toNumber()

      setBalance(balance)
      setIsLoading(false)
    })()
  }, [isLoadingSnowmanContract, isConnected, connectedAccount])

  return (
    <>
      <Head>
        <title>Snowman - Composable NFT</title>
        <meta name="description" content="ERC4883 Composable Snowman NFT" />
      </Head>

    <main className="flex flex-col items-center gap-4 px-4 py-12">
      <h2 className="text-[1.8rem] md:text-[2.5rem] text-center h-16 md:h-20">Do you wanna build a <br /><strong className="text-orange-500">{animatedText}</strong></h2>
      <p className="text-md md:text-xl -mt-2 text-center max-w-lg">Mint a unique Snowman☃️ for 0.02 ETH and compose with a bunch of <Link href="/accessories" className="underline transition duration-300 text-orange-300 hover:text-orange-500 font-bold">accessories</Link>🎩🧣</p>
      <button className="border-orange-500 bg-orange-500 hover:border-black hover:bg-white hover:text-black transition-all px-4 py-2 text-white rounded-md shadow-lg" onClick={handleMint} disabled={isMinting}>{isMinting? <Spinner size="md" thickness='4px' speed='0.65s' />: "Mint One"}</button>

      {!isLoading? (<SnowmanList balance={balance} />): <Spinner size="md" thickness='4px' speed='0.65s' className="mt-10" />}

    </main>
    </>
  );
};

export default Home;

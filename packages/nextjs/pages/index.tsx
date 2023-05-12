import React, {useState, useEffect} from "react";
import Head from "next/head";
import type { NextPage } from "next";
import Link from "next/link";

import { Spinner } from '@chakra-ui/react'
import { useTypewriter } from 'react-simple-typewriter'
import { useAccount } from "wagmi";

import { useScaffoldContractWrite, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import SnowmanList from "~~/components/SnowmanList";


const Home: NextPage = () => {
  const [animatedText] = useTypewriter({
    words: ['Snowman?☃️', 'Half-Assed Olaf?🫡'],
    loop: 0,
    delaySpeed: 2500
  })

  const [balance, setBalance] = useState<number | undefined>()

  const {address: connectedAccount, isConnected} = useAccount()

  const {data: userBalance} = useScaffoldContractRead({
    contractName: "Snowman",
    functionName: "balanceOf",
    args: [connectedAccount]
  })

  const {writeAsync: mint, isLoading: isMinting, isSuccess: isMinted} = useScaffoldContractWrite({
    contractName: "Snowman",
    functionName: "mint",
    value: "0.02",
    onSuccess: () => {
      if(balance) {
        setBalance(balance => balance + 1)
      } else {
        setBalance(1)
      }
    }
  })

  useEffect(() => {
    if(!isConnected) return 

    setBalance(userBalance && userBalance.toNumber && userBalance.toNumber())

  }, [isConnected, connectedAccount])

  return (
    <>
      <Head>
        <title>Snowman - Composable NFT</title>
        <meta name="description" content="ERC4883 Composable Snowman NFT" />
      </Head>

    <main className="flex flex-col items-center gap-4 px-4 py-12">
      <h2 className="text-[1.8rem] md:text-[2.5rem] text-center h-16 md:h-20">Do you wanna build a <br /><strong className="text-orange-500">{animatedText}</strong></h2>
      <p className="text-md md:text-xl -mt-2 text-center max-w-lg">Mint a unique Snowman☃️ for 0.02 ETH and compose with a bunch of <Link href="/" className="underline transition duration-300 text-orange-300 hover:text-orange-500 font-bold">accessories</Link>🎩🧣</p>
      <button className="border-orange-500 bg-orange-500 hover:border-black hover:bg-white hover:text-black transition-all px-4 py-2 text-white rounded-md shadow-lg" onClick={mint} disabled={isMinting}>{isMinting? <Spinner size="md" thickness='4px' speed='0.65s' />: "Mint One"}</button>

      {balance !== undefined? (<SnowmanList balance={balance} />): <Spinner size="md" thickness='4px' speed='0.65s' className="mt-10" />}

    </main>
    </>
  );
};

export default Home;

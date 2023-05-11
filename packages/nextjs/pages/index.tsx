import Head from "next/head";
import type { NextPage } from "next";
import Link from "next/link";

import { useTypewriter } from 'react-simple-typewriter'

import Snowman from "~~/components/cards/Snowman";

const Home: NextPage = () => {
  const [animatedText] = useTypewriter({
    words: ['Snowman?', 'Half-Assed Olaf?🫡'],
    loop: 0,
    delaySpeed: 2500
  })

  return (
    <>
      <Head>
        <title>Snowman - Composable NFT</title>
        <meta name="description" content="ERC4883 Composable Snowman NFT" />
      </Head>

    <main className="flex flex-col items-center gap-4 px-4 py-12">
      <h2 className="text-[1.8rem] md:text-[2.5rem] text-center h-16 md:h-20">Do you wanna build a <br /><strong className="text-orange-500">{animatedText}</strong></h2>
      <p className="text-md md:text-xl -mt-2 text-center max-w-lg">Mint a unique Snowman☃️ for 0.02 ETH and compose with a bunch of <Link href="/" className="underline transition duration-300 text-orange-300 hover:text-orange-500 font-bold">accessories</Link>🎩🧣</p>
      <button className="border-orange-500 bg-orange-500 hover:border-black hover:bg-white hover:text-black transition-all px-4 py-2 text-white rounded-md shadow-lg">Mint One</button>

      <div className="flex flex-wrap justify-center items-center gap-5 my-10">
       {[1,2,3,4,5].map(i => <Snowman />)}
      </div>
    </main>
    </>
  );
};

export default Home;

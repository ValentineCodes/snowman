import Head from "next/head";
import type { NextPage } from "next";
import Link from "next/link";
import Typewriter from 'typewriter-effect';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Snowman - Composable NFT</title>
        <meta name="description" content="ERC4883 Composable Snowman NFT" />
      </Head>

    <main className="flex flex-col items-center gap-4">
      <p>Mint a unique snowman☃️ for 0.02 ETH and compose with a bunch of <Link href="/">accessories</Link></p>
    </main>
    </>
  );
};

export default Home;

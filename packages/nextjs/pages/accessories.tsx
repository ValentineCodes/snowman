import Head from "next/head";
import type { NextPage } from "next";
import AccessoryUI from "~~/components/AccessoryUI";

const ExampleUI: NextPage = () => {
  return (
    <>
      <Head>
        <title>Accessories</title>
        <meta name="description" content="Created with 🏗 scaffold-eth-2" />
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </Head>

      <AccessoryUI />
    </>
  );
};

export default ExampleUI;

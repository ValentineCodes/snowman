import Head from "next/head";
import type { NextPage } from "next";
import AccessoryUI from "~~/components/AccessoryUI";
import { useState } from "react";

interface AccessoryProps {
  name: string,
  icon: string | JSX.Element
}
const accessories: AccessoryProps[] = [{
  name: "Hat",
  icon: "🎩"
}, {
  name: "Scarf",
  icon: "🧣"
}, {
  name: "Belt",
  icon: "⑄"
}]

const Accessories: NextPage = () => {
  const [selectedAccessory, setSelectedAccessory] = useState<AccessoryProps>(accessories[0])
  return (
    <>
      <Head>
        <title>Accessories</title>
        <meta name="description" content="Created with 🏗 scaffold-eth-2" />
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </Head>

      <div className="flex flex-row justify-center mx-auto gap-2 w-full max-w-7xl py-4 px-6 lg:px-10 flex-wrap">
                {accessories.map(accessory => (
                  <button
                    className={`btn btn-secondary btn-sm normal-case font-thin ${
                      accessory.name === selectedAccessory.name ? "bg-base-300" : "bg-base-100"
                    }`}
                    key={accessory.name}
                    onClick={() => setSelectedAccessory(accessory)}
                  >
                    {accessory.name}
                  </button>
                ))}
              </div>

      <AccessoryUI name={selectedAccessory.name} icon={selectedAccessory.icon} />
    </>
  );
};

export default Accessories;

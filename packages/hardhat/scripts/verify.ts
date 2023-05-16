import { run } from "hardhat";

export const verify = async (contractAddress: string, args: any[]) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
};

verify("0x50eF2705Ec4B7ad8baC3a2f941Aee2CDc9a2B786", ["0x7a82bbfD10E3Ce5817dEcC0ee870e17D6853D901"]).catch(error => {
  console.error(error);
  process.exitCode = 1;
});

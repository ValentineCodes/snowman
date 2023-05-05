import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { Hat } from "../../typechain-types";
import { BigNumber } from "ethers";

describe("Hat🎩", () => {
  const MINT_FEE: BigNumber = ethers.utils.parseEther("0.01");

  let owner: SignerWithAddress;
  let valentine: SignerWithAddress;

  let hat: Hat;

  beforeEach(async () => {
    const signers: SignerWithAddress[] = await ethers.getSigners();

    owner = signers[0];
    valentine = signers[1];

    await deployments.fixture("Hat");

    hat = await ethers.getContract("Hat", valentine);
  });

  describe("💬mint", () => {
    it("mints one(1) Hat🎩 with unique attributes for 0.01 ETH💎", async () => {
      // Mint Hat
      const feeCollector: string = await hat.getFeeCollector();
      const oldFeeCollectorBalance: BigNumber = await ethers.provider.getBalance(feeCollector);
      console.log("Old Balance: ", ethers.utils.formatEther(oldFeeCollectorBalance), "💎");

      console.log("Minting One(1) Hat🎩...");
      await hat.mint({ value: MINT_FEE });
      console.log(`Successfully Minted One(1) Hat🎩`);

      console.log(await hat.tokenURI(1));

      const newFeeCollectorBalance: BigNumber = await ethers.provider.getBalance(feeCollector);
      console.log("New Balance: ", ethers.utils.formatEther(newFeeCollectorBalance), "💎");
      expect(newFeeCollectorBalance).to.equal(oldFeeCollectorBalance.add(MINT_FEE));
    });
  });
});

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { Snowman } from "../../typechain-types";
import { BigNumber } from "ethers";

describe("Snowman☃️", () => {
  let owner: SignerWithAddress;
  let valentine: SignerWithAddress;

  let snowman: Snowman;

  beforeEach(async () => {
    const signers: SignerWithAddress[] = await ethers.getSigners();

    owner = signers[0];
    valentine = signers[1];

    await deployments.fixture("Snowman");

    snowman = await ethers.getContract("Snowman", valentine);
  });

  describe("💬mint", () => {
    it("mints one(1) Snowman☃️ with unique attributes for 0.02 ETH💎", async () => {
      // Mint Snowman
      const feeCollector: string = await snowman.getFeeCollector();
      const oldFeeCollectorBalance: BigNumber = await ethers.provider.getBalance(feeCollector);
      console.log("Old Balance: ", ethers.utils.formatEther(oldFeeCollectorBalance), "💎");
      const MINT_FEE: BigNumber = ethers.utils.parseEther("0.02");

      console.log("Minting One(1) Snowman☃️...");
      await snowman.mint({ value: MINT_FEE });
      console.log(`Successfully Minted One(1) Snowman☃️`);

      const newFeeCollectorBalance: BigNumber = await ethers.provider.getBalance(feeCollector);
      console.log("New Balance: ", ethers.utils.formatEther(newFeeCollectorBalance), "💎");
      expect(newFeeCollectorBalance).to.equal(oldFeeCollectorBalance.add(MINT_FEE));
    });
  });
});

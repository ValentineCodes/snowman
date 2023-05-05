import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { Hat, Snowman } from "../../typechain-types";
import { BigNumber } from "ethers";

describe("Snowman☃️", () => {
  const SNOWMAN_MINT_FEE: BigNumber = ethers.utils.parseEther("0.02");
  const HAT_MINT_FEE: BigNumber = ethers.utils.parseEther("0.01");

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

      console.log("Minting One(1) Snowman☃️...");
      await snowman.mint({ value: SNOWMAN_MINT_FEE });
      console.log(`Successfully Minted One(1) Snowman☃️`);

      const newFeeCollectorBalance: BigNumber = await ethers.provider.getBalance(feeCollector);
      console.log("New Balance: ", ethers.utils.formatEther(newFeeCollectorBalance), "💎");
      expect(newFeeCollectorBalance).to.equal(oldFeeCollectorBalance.add(SNOWMAN_MINT_FEE));
    });
  });

  describe("💬addAccessory", () => {
    it("adds other nfts to the snowman for composition", async () => {
      await snowman.mint({ value: SNOWMAN_MINT_FEE });
      console.log("Snowman minted✅");

      await deployments.fixture("Hat");

      const hat: Hat = await ethers.getContract("Hat", valentine);
      await hat.mint({ value: HAT_MINT_FEE });

      expect((await hat.ownerOf(1)).toLowerCase()).to.equal(valentine.address.toLowerCase());
      console.log("Hat minted✅");

      await snowman.connect(owner).addAccessory(hat.address, 1);
      console.log("Hat added as an accessory✅");

      const snowmanId = ethers.utils.defaultAbiCoder.encode(["uint256"], [1]);
      await hat["safeTransferFrom(address,address,uint256,bytes)"](valentine.address, snowman.address, 1, snowmanId);
    });
  });
});

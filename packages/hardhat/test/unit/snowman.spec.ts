import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { Belt, Hat, Scarf, Snowman } from "../../typechain-types";
import { BigNumber } from "ethers";

describe("Snowman☃️", () => {
  const SNOWMAN_MINT_FEE: BigNumber = ethers.utils.parseEther("0.02");
  const ACCESSORY_MINT_FEE: BigNumber = ethers.utils.parseEther("0.01");

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

  describe("💬addAccessory test-focus", () => {
    it("adds accessories to the snowman for composition", async () => {
      await snowman.mint({ value: SNOWMAN_MINT_FEE });
      console.log("Snowman minted✅");

      // deploy accessories
      await deployments.fixture(["Hat", "Scarf", "Belt"]);

      const hat: Hat = await ethers.getContract("Hat", valentine);
      await hat.mint({ value: ACCESSORY_MINT_FEE });

      const scarf: Scarf = await ethers.getContract("Scarf", valentine);
      await scarf.mint({ value: ACCESSORY_MINT_FEE });

      const belt: Belt = await ethers.getContract("Belt", valentine);
      await belt.mint({ value: ACCESSORY_MINT_FEE });

      await snowman.connect(owner).addAccessory(hat.address, 1);
      await snowman.connect(owner).addAccessory(scarf.address, 0);
      await snowman.connect(owner).addAccessory(belt.address, 0);

      const snowmanId = ethers.utils.defaultAbiCoder.encode(["uint256"], [1]);
      await hat["safeTransferFrom(address,address,uint256,bytes)"](valentine.address, snowman.address, 1, snowmanId);
      await scarf["safeTransferFrom(address,address,uint256,bytes)"](valentine.address, snowman.address, 1, snowmanId);
      await belt["safeTransferFrom(address,address,uint256,bytes)"](valentine.address, snowman.address, 1, snowmanId);

      console.log("Added hat and scarf as an accessory✅");
      console.log(await snowman.tokenURI(1));
    });
  });
});

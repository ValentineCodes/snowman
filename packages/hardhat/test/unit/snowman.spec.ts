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
  let hat: Hat;
  let scarf: Scarf;
  let belt: Belt;
  let accessories: string[];

  beforeEach(async () => {
    const signers: SignerWithAddress[] = await ethers.getSigners();

    owner = signers[0];
    valentine = signers[1];

    await deployments.fixture(["Snowman", "Hat", "Scarf", "Belt"]);

    snowman = await ethers.getContract("Snowman", valentine);
    hat = await ethers.getContract("Hat", valentine);
    scarf = await ethers.getContract("Scarf", valentine);
    belt = await ethers.getContract("Belt", valentine);
    accessories = [hat.address, scarf.address, belt.address];
  });

  describe("mint?", () => {
    it("mints one(1) Snowman☃️ with unique attributes for 0.02 ETH💎", async () => {
      // Mint Snowman
      const feeCollector: string = await snowman.getFeeCollector();
      const oldFeeCollectorBalance: BigNumber = await ethers.provider.getBalance(feeCollector);
      const oldTokenBalance: BigNumber = await snowman.balanceOf(valentine.address);

      console.log("Minting One(1) Snowman☃️...");
      await snowman.mint({ value: SNOWMAN_MINT_FEE });

      const newTokenBalance: BigNumber = await snowman.balanceOf(valentine.address);
      expect(newTokenBalance).to.equal(oldTokenBalance.add(1));
      console.log(`Successfully Minted One(1) Snowman☃️`);

      const newFeeCollectorBalance: BigNumber = await ethers.provider.getBalance(feeCollector);
      expect(newFeeCollectorBalance).to.equal(oldFeeCollectorBalance.add(SNOWMAN_MINT_FEE));
    });
    it("emits a Transfer event", async () => {
      await expect(snowman.mint({ value: SNOWMAN_MINT_FEE })).to.emit(snowman, "Transfer");
    });
    it("reverts if mint fee is not enough", async () => {
      await expect(snowman.mint({ value: ethers.utils.parseEther("0.01") })).to.be.revertedWithCustomError(
        snowman,
        "Snowman__NotEnoughEth",
      );
    });
  });

  describe("addAccessory?", () => {
    it("adds accessory", async () => {
      console.log("Adding hat🎩 accessory...");
      await snowman.connect(owner).addAccessory(hat.address, 1);

      expect(await snowman.isAccessoryAvailable(hat.address)).to.be.true;
      expect((await snowman.getAccessories()).some(accessory => accessory._address === hat.address)).to.be.true;
      console.log("Hat🎩 added✅");
    });
    it("emits an AccessoryAdded event", async () => {
      await expect(snowman.connect(owner).addAccessory(hat.address, 1))
        .to.emit(snowman, "AccessoryAdded")
        .withArgs(hat.address);
    });
    it("reverts if caller is not owner", async () => {
      await expect(snowman.addAccessory(hat.address, 1)).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("reverts if accessory already exists", async () => {
      await snowman.connect(owner).addAccessory(hat.address, 1);
      await expect(snowman.connect(owner).addAccessory(hat.address, 1)).to.revertedWithCustomError(
        snowman,
        "Snowman__AcccessoryAlreadyExists",
      );
    });
  });

  describe("addAccessories?", () => {
    it("adds accessories", async () => {
      console.log("Adding hat🎩, scarf🧣 and belt⑄...");
      await snowman.connect(owner).addAccessories(accessories, [1, 0, 0]);

      expect(await snowman.isAccessoryAvailable(hat.address)).to.be.true;
      expect(await snowman.isAccessoryAvailable(scarf.address)).to.be.true;
      expect(await snowman.isAccessoryAvailable(belt.address)).to.be.true;
      expect((await snowman.getAccessories()).some(accessory => accessories.includes(accessory._address))).to.be.true;
    });
    it("emits an AccessoriesAdded event", async () => {
      await expect(snowman.connect(owner).addAccessories(accessories, [1, 0, 0]))
        .to.emit(snowman, "AccessoriesAdded")
        .withArgs(accessories);
    });
    it("reverts if caller is not owner", async () => {
      await expect(snowman.addAccessories(accessories, [1, 0, 0])).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
    it("reverts if accessories length does not match positions length", async () => {
      await expect(snowman.connect(owner).addAccessories(accessories, [1, 0])).to.be.revertedWithCustomError(
        snowman,
        "Snowman__AccessoriesCountMismatch",
      );
    });
  });

  describe("removeAccessory?", () => {
    it("removes accessory from user's snowman", async () => {});
  });

  // describe("generate snowman with accessories", () => {
  //   it("adds accessories to the snowman for composition", async () => {
  //     await snowman.mint({ value: SNOWMAN_MINT_FEE });
  //     console.log("Snowman minted✅");

  //     // deploy accessories
  //     await deployments.fixture(["Hat", "Scarf", "Belt"]);

  //     const hat: Hat = await ethers.getContract("Hat", valentine);
  //     await hat.mint({ value: ACCESSORY_MINT_FEE });

  //     const scarf: Scarf = await ethers.getContract("Scarf", valentine);
  //     await scarf.mint({ value: ACCESSORY_MINT_FEE });

  //     const belt: Belt = await ethers.getContract("Belt", valentine);
  //     await belt.mint({ value: ACCESSORY_MINT_FEE });

  //     await snowman.connect(owner).addAccessory(hat.address, 1);
  //     await snowman.connect(owner).addAccessory(scarf.address, 0);
  //     await snowman.connect(owner).addAccessory(belt.address, 0);

  //     const snowmanId = ethers.utils.defaultAbiCoder.encode(["uint256"], [1]);
  //     await hat["safeTransferFrom(address,address,uint256,bytes)"](valentine.address, snowman.address, 1, snowmanId);
  //     await scarf["safeTransferFrom(address,address,uint256,bytes)"](valentine.address, snowman.address, 1, snowmanId);
  //     await belt["safeTransferFrom(address,address,uint256,bytes)"](valentine.address, snowman.address, 1, snowmanId);
  //     console.log("Added hat and scarf as an accessory✅");

  //     const tokenURI = await (await fetch(await snowman.tokenURI(1))).json();
  //   });
  // });
});

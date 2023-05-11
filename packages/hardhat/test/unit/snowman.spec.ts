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

  describe("mint()", () => {
    it("mints one(1) Snowman☃️ with unique attributes for 0.02 ETH💎", async () => {
      // Mint Snowman
      const oldTokenBalance: BigNumber = await snowman.balanceOf(valentine.address);

      console.log("Minting One(1) Snowman☃️...");
      await snowman.mint({ value: SNOWMAN_MINT_FEE });

      const newTokenBalance: BigNumber = await snowman.balanceOf(valentine.address);
      expect(newTokenBalance).to.equal(oldTokenBalance.add(1));
      console.log(`Mint successful✅`);
    });
    it("emits an event", async () => {
      await expect(snowman.mint({ value: SNOWMAN_MINT_FEE })).to.emit(snowman, "Transfer");
    });
    it("reverts if mint fee is not enough", async () => {
      await expect(snowman.mint({ value: ethers.utils.parseEther("0.01") })).to.be.revertedWithCustomError(
        snowman,
        "Snowman__InvalidMintFee",
      );
    });
  });

  describe("addAccessory()", () => {
    it("adds accessory", async () => {
      console.log("Adding hat🎩 accessory...");
      await snowman.connect(owner).addAccessory(hat.address, 1);

      expect(await snowman.isAccessoryAvailable(hat.address)).to.be.true;
      expect((await snowman.getAccessories()).some(accessory => accessory._address === hat.address)).to.be.true;
      console.log("Hat🎩 added✅");
    });
    it("emits an event", async () => {
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

  describe("addAccessories()", () => {
    it("adds accessories", async () => {
      console.log("Adding hat🎩, scarf🧣 and belt⑄...");
      await snowman.connect(owner).addAccessories(accessories, [1, 0, 0]);

      expect(await snowman.isAccessoryAvailable(hat.address)).to.be.true;
      expect(await snowman.isAccessoryAvailable(scarf.address)).to.be.true;
      expect(await snowman.isAccessoryAvailable(belt.address)).to.be.true;
      expect((await snowman.getAccessories()).some(accessory => accessories.includes(accessory._address))).to.be.true;
      console.log("Accessories added✅");
    });
    it("emits an event", async () => {
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

  describe("removeAccessory()", () => {
    beforeEach(async () => {
      await snowman.mint({ value: SNOWMAN_MINT_FEE });
      await hat.mint({ value: ACCESSORY_MINT_FEE });

      await snowman.connect(owner).addAccessory(hat.address, 1);
      await snowman.connect(owner).addAccessory(scarf.address, 0);

      const encodedSnowmanId = ethers.utils.defaultAbiCoder.encode(["uint256"], [1]);
      await hat["safeTransferFrom(address,address,uint256,bytes)"](
        valentine.address,
        snowman.address,
        1,
        encodedSnowmanId,
      );
    });

    it("removes accessory from user's snowman and emits an event", async () => {
      console.log("Removing hat🎩...");
      await expect(snowman.removeAccessory(hat.address, 1))
        .to.emit(snowman, "AccessoryRemoved")
        .withArgs(hat.address, 1);

      expect(await snowman.getAccessoryById(hat.address, 1)).to.equal(0);
      console.log("Hat🎩 removed✅");
    });
    it("reverts if caller is not snowman owner", async () => {
      await expect(snowman.connect(owner).removeAccessory(hat.address, 1)).to.be.revertedWithCustomError(
        snowman,
        "Snowman__NotOwner",
      );
    });
    it("reverts if accessory is not available", async () => {
      await expect(snowman.removeAccessory(belt.address, 1)).to.be.revertedWithCustomError(
        snowman,
        "Snowman__UnavailableAccessory",
      );
    });
    it("reverts if accessory is not worn", async () => {
      await expect(snowman.removeAccessory(scarf.address, 1)).to.be.revertedWithCustomError(
        snowman,
        "Snowman__AccessoryNotWorn",
      );
    });
    it("transfers accessory back to snowman owner", async () => {
      await snowman.removeAccessory(hat.address, 1);

      expect(await hat.ownerOf(1)).to.equal(valentine.address);
    });
  });

  describe("removeAllAccessories()", () => {
    beforeEach(async () => {
      // Add hat and scarf accessories
      await snowman.mint({ value: SNOWMAN_MINT_FEE });
      await hat.mint({ value: ACCESSORY_MINT_FEE });
      await scarf.mint({ value: ACCESSORY_MINT_FEE });

      await snowman.connect(owner).addAccessory(hat.address, 1);
      await snowman.connect(owner).addAccessory(scarf.address, 0);

      const encodedSnowmanId = ethers.utils.defaultAbiCoder.encode(["uint256"], [1]);
      await hat["safeTransferFrom(address,address,uint256,bytes)"](
        valentine.address,
        snowman.address,
        1,
        encodedSnowmanId,
      );
      await scarf["safeTransferFrom(address,address,uint256,bytes)"](
        valentine.address,
        snowman.address,
        1,
        encodedSnowmanId,
      );
    });

    it("removes all accessories from user's snowman and emits an event", async () => {
      console.log("Removing all accessories🎩🧣...");
      await expect(snowman.removeAllAccessories(1)).to.emit(snowman, "AccessoriesRemoved");

      expect(await snowman.getAccessoryById(hat.address, 1)).to.equal(0);
      expect(await snowman.getAccessoryById(scarf.address, 1)).to.equal(0);
      console.log("Accessories removed✅");
    });
    it("reverts if caller is not snowman owner", async () => {
      await expect(snowman.connect(owner).removeAllAccessories(1)).to.be.revertedWithCustomError(
        snowman,
        "Snowman__NotOwner",
      );
    });
  });

  describe("onERC721Received", () => {
    it("adds accessory to user's snowman", async () => {
      await snowman.mint({ value: SNOWMAN_MINT_FEE });
      await hat.mint({ value: ACCESSORY_MINT_FEE });

      await snowman.connect(owner).addAccessory(hat.address, 1);

      // Add accessory to snowman
      const encodedSnowmanId = ethers.utils.defaultAbiCoder.encode(["uint256"], [1]);
      await hat["safeTransferFrom(address,address,uint256,bytes)"](
        valentine.address,
        snowman.address,
        1,
        encodedSnowmanId,
      );

      expect(await snowman.getAccessoryById(hat.address, 1)).to.equal(1);
    });
    it("reverts if caller is not snowman owner", async () => {
      await snowman.mint({ value: SNOWMAN_MINT_FEE });
      await snowman.connect(owner).mint({ value: SNOWMAN_MINT_FEE });
      await hat.mint({ value: ACCESSORY_MINT_FEE });

      await snowman.connect(owner).addAccessory(hat.address, 1);

      // Add accessory to snowman
      const encodedSnowmanId = ethers.utils.defaultAbiCoder.encode(["uint256"], [2]);
      await expect(
        hat["safeTransferFrom(address,address,uint256,bytes)"](valentine.address, snowman.address, 1, encodedSnowmanId),
      ).to.be.revertedWithCustomError(snowman, "Snowman__NotOwner");
    });

    it("reverts if snowman cannot wear the accessory", async () => {
      await snowman.mint({ value: SNOWMAN_MINT_FEE });
      await hat.mint({ value: ACCESSORY_MINT_FEE });

      // Add accessory to snowman
      const encodedSnowmanId = ethers.utils.defaultAbiCoder.encode(["uint256"], [1]);
      await expect(
        hat["safeTransferFrom(address,address,uint256,bytes)"](valentine.address, snowman.address, 1, encodedSnowmanId),
      ).to.be.revertedWithCustomError(snowman, "Snowman__CannotWearAccessory");
    });
  });

  describe("withdrawFees()", () => {
    it("transfers fees to fee collector", async () => {
      await snowman.mint({ value: SNOWMAN_MINT_FEE });

      const feeCollector: string = await snowman.getFeeCollector();
      const oldFeeCollectorBalance: BigNumber = await ethers.provider.getBalance(feeCollector);

      await snowman.withdrawFees();

      const newFeeCollectorBalance: BigNumber = await ethers.provider.getBalance(feeCollector);
      expect(newFeeCollectorBalance).to.equal(oldFeeCollectorBalance.add(SNOWMAN_MINT_FEE));
    });
  });
});

/// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

import {ISnowman} from "./interfaces/ISnowman.sol";
import {IERC721Receiver} from "./interfaces/IERC721Receiver.sol";
import {Errors} from "./interfaces/Errors.sol";

import {DataTypes} from "./libraries/types/DataTypes.sol";
import {SnowmanMetadata} from "./libraries/logic/metadata/SnowmanMetadata.sol";
import {TypeCast} from "./libraries/utils/TypeCast.sol";
import {ColorGen} from "./libraries/utils/ColorGen.sol";
import {PRNG} from "./libraries/utils/PRNG.sol";
import {AccessoryManager} from "./libraries/logic/AccessoryManager.sol";
import {AttributesGen} from "./libraries/logic/AttributesGen.sol";

abstract contract Accessory {
  function renderTokenById(uint256 id) external view virtual returns (string memory);

  function transferFrom(address from, address to, uint256 id) external virtual;
}

/**
 * @title Snowman⛄️ - ERC4883 Composable Snowman NFT
 * @author Valentine Orga
 * @notice Mint snowman and compose with other accessories(other NFTs) approved by the admin.
 *         Compose snowman by placing items in the foreground or background of your snowman.☃️
 */
contract Snowman is ISnowman, ERC721Enumerable, IERC721Receiver, Ownable, Errors {
  using TypeCast for bytes;
  using Counters for Counters.Counter;

  event FeeCollectorChanged(address oldFeeCollector, address newFeeCollector);

  uint256 constant MINT_FEE = 0.02 ether;
  address payable s_feeCollector;
  Counters.Counter private s_tokenIds;

  mapping(uint256 => DataTypes.Snowman) private s_attributes;

  DataTypes.Accessory[] private s_accessories;
  mapping(address => bool) private s_accessoriesAvailable;

  // accessory address > snowman id > accessory id
  mapping(address => mapping(uint256 => uint256)) private s_accessoriesById;

  constructor(address feeCollector) ERC721("Snowman", "Snowman") {
    s_feeCollector = payable(feeCollector);
  }

  function mint() public payable returns (uint256) {
    if (msg.value < MINT_FEE) revert Errors.Snowman__NotEnoughEth();

    s_tokenIds.increment();

    uint256 tokenId = s_tokenIds.current();
    _mint(msg.sender, tokenId);

    AttributesGen.generateAttributes(s_attributes, tokenId);

    (bool success, ) = s_feeCollector.call{value: msg.value}("");

    if (!success) revert Errors.Snowman__TransferFailed();

    return tokenId;
  }

  function addAccessory(address accessory, DataTypes.AccessoryPosition position) public onlyOwner {
    AccessoryManager.addAccessory(s_accessoriesAvailable, s_accessories, accessory, position);
  }

  function addAccessories(
    address[] calldata accessories,
    DataTypes.AccessoryPosition[] calldata positions
  ) public onlyOwner {
    AccessoryManager.addAccessories(s_accessoriesAvailable, s_accessories, accessories, positions);
  }

  function removeAccessory(address accessory, uint256 snowmanId) public {
    AccessoryManager.removeAccessory(s_accessoriesAvailable, s_accessoriesById, accessory, snowmanId);
  }

  function removeAllAccessories(uint256 snowmanId) public {
    AccessoryManager.removeAllAccessories(s_accessories, s_accessoriesById, snowmanId);
  }

  function hasAccessory(address accessory, uint256 snowmanId) public view returns (bool) {
    return AccessoryManager.hasAccessory(s_accessoriesAvailable, s_accessoriesById, accessory, snowmanId);
  }

  function accessoryId(address accessory, uint256 snowmanId) external view returns (uint256) {
    return AccessoryManager.accessoryId(s_accessoriesAvailable, s_accessoriesById, accessory, snowmanId);
  }

  function tokenURI(uint256 tokenId) public view override(ERC721, ISnowman) returns (string memory) {
    if (!_exists(tokenId)) revert Errors.Snowman__NotMinted();

    return SnowmanMetadata.tokenURI(s_accessories, s_accessoriesById, s_attributes[tokenId], tokenId);
  }

  function renderTokenById(uint256 tokenId) public view returns (string memory) {
    DataTypes.Snowman memory snowman = s_attributes[tokenId];

    return SnowmanMetadata.renderTokenById(s_accessories, s_accessoriesById, snowman, tokenId);
  }

  function onERC721Received(
    address operator,
    address from,
    uint256 tokenId,
    bytes calldata snowmanIdData
  ) external returns (bytes4) {
    uint256 snowmanId = snowmanIdData.toUint256();

    if (ownerOf(snowmanId) != from) revert Errors.Snowman__NotAccessoryOwner();
    if (s_accessoriesAvailable[msg.sender] == false) revert Errors.Snowman__CannotWearAccessory();
    if (s_accessoriesById[msg.sender][snowmanId] > 0) revert Errors.Snowman__AccessoryAlreadyWorn();

    s_accessoriesById[msg.sender][snowmanId] = tokenId;

    return this.onERC721Received.selector;
  }

  function setFeeCollector(address newFeeCollector) public onlyOwner {
    address oldFeeCollector = s_feeCollector;
    if (newFeeCollector == address(0)) revert Errors.Snowman__ZeroAddress();
    if (newFeeCollector == oldFeeCollector) revert Errors.Snowman__InvalidFeeCollector();

    s_feeCollector = payable(newFeeCollector);

    emit FeeCollectorChanged(oldFeeCollector, newFeeCollector);
  }

  function getFeeCollector() public view returns (address) {
    return s_feeCollector;
  }

  function getAttributes(uint256 tokenId) public view returns (DataTypes.Snowman memory) {
    return s_attributes[tokenId];
  }

  function getAccessories() public view returns (DataTypes.Accessory[] memory) {
    return s_accessories;
  }

  function isAccessoryAvailable(address accessory) public view returns (bool) {
    return s_accessoriesAvailable[accessory];
  }
}

/// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "base64-sol/base64.sol";

import {DataTypes} from "./libraries/types/DataTypes.sol";
import {ToColor} from "./libraries/helpers/ToColor.sol";
import {TypeCast} from "./libraries/helpers/TypeCast.sol";

error Snowman__NotMinted();
error Snowman__NotEnoughEth();
error Snowman__TransferFailed();
error Snowman__ZeroAddress();
error Snowman__InvalidFeeCollector();
error Snowman__AcccessoryAlreadyExists();
error Snowman__CannotWearAccessory();
error Snowman__AccessoryAlreadyWorn();
error Snowman__NotAccessoryOwner();

abstract contract Accessory {
  function renderTokenById(uint256 id) external view virtual returns (string memory);

  function transferFrom(address from, address to, uint256 id) external virtual;
}

contract Snowman is ERC721Enumerable, IERC721Receiver, Ownable {
  using Strings for uint256;
  using ToColor for bytes3;
  using TypeCast for bytes;
  using Counters for Counters.Counter;

  event FeeCollectorChanged(address oldFeeCollector, address newFeeCollector);

  uint256 constant MINT_FEE = 0.02 ether;
  address s_feeCollector;
  Counters.Counter private s_tokenIds;

  mapping(uint256 => DataTypes.Snowman) private s_attributes;

  Accessory[] private s_accessories;
  mapping(address => bool) private s_accessoriesAvailable;
  mapping(address => mapping(uint256 => uint256)) private s_accessdoriesById;

  constructor(address feeCollector) ERC721("Snowman", "Snowman") {
    s_feeCollector = feeCollector;
  }

  function mint() public payable returns (uint256) {
    if (msg.value < MINT_FEE) revert Snowman__NotEnoughEth();

    s_tokenIds.increment();

    uint256 tokenId = s_tokenIds.current();
    _mint(msg.sender, tokenId);

    DataTypes.Snowman memory snowman;

    // generate color
    bytes32 randHash = keccak256(abi.encodePacked(blockhash(block.number - 1), msg.sender, address(this)));
    snowman.cloudColor = bytes2(randHash[0]) | (bytes2(randHash[1]) >> 8) | (bytes3(randHash[2]) >> 16);

    // generate iris position
    uint256 randNum = uint256(randHash) % 20;
    snowman.irisPosition = randNum + 328;

    s_attributes[tokenId] = snowman;

    (bool success, ) = payable(owner()).call{value: msg.value}("");

    if (!success) revert Snowman__TransferFailed();

    return tokenId;
  }

  function addAccessory(address accessory) public onlyOwner {
    s_accessoriesAvailable[accessory] = true;
    s_accessories.push(Accessory(accessory));
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {}

  function renderTokenById(uint256 tokenId) public view returns (string memory) {}

  function onERC721Received(
    address operator,
    address from,
    uint256 tokenId,
    bytes calldata snowmanIdData
  ) external override returns (bytes4) {
    uint256 snowmanId = snowmanIdData.toUint256();

    if (ownerOf(snowmanId) != from) revert Snowman__NotAccessoryOwner();
    if (s_accessoriesAvailable[msg.sender] == false) revert Snowman__CannotWearAccessory();
    if (s_accessdoriesById[msg.sender][snowmanId] > 0) revert Snowman__AccessoryAlreadyWorn();

    s_accessdoriesById[msg.sender][snowmanId] = tokenId;

    return this.onERC721Received.selector;
  }

  function setFeeCollector(address newFeeCollector) public onlyOwner {
    address oldFeeCollector = s_feeCollector;
    if (newFeeCollector == address(0)) revert Snowman__ZeroAddress();
    if (newFeeCollector == oldFeeCollector) revert Snowman__InvalidFeeCollector();

    s_feeCollector = newFeeCollector;

    emit FeeCollectorChanged(oldFeeCollector, newFeeCollector);
  }

  function getFeeCollector() public view returns (address) {
    return s_feeCollector;
  }

  function getAttributes(uint256 tokenId) public view returns (DataTypes.Snowman memory) {
    return s_attributes[tokenId];
  }

  function getAccessories() public view returns (Accessory[] memory) {
    return s_accessories;
  }

  function isAccessoryAvailable(address accessory) public view returns (bool) {
    return s_accessoriesAvailable[accessory];
  }
}

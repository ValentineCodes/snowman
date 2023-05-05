/// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

import {DataTypes} from "./libraries/types/DataTypes.sol";
import {SnowmanMetadata} from "./libraries/logic/metadata/SnowmanMetadata.sol";
import {TypeCast} from "./libraries/helpers/TypeCast.sol";

error Snowman__NotMinted();
error Snowman__NotEnoughEth();
error Snowman__TransferFailed();
error Snowman__ZeroAddress();
error Snowman__InvalidFeeCollector();
error Snowman__AcccessoryAlreadyExists();
error Snowman__CannotWearAccessory();
error Snowman__AccessoryAlreadyWorn();
error Snowman__AccessoryNotWorn();
error Snowman__NotAccessoryOwner();
error Snowman__NotOwner();
error Snowman__UnavailableAccessory();

abstract contract Accessory {
  function renderTokenById(uint256 id) external view virtual returns (string memory);

  function transferFrom(address from, address to, uint256 id) external virtual;
}

contract Snowman is ERC721Enumerable, IERC721Receiver, Ownable {
  using TypeCast for bytes;
  using Counters for Counters.Counter;

  event FeeCollectorChanged(address oldFeeCollector, address newFeeCollector);

  uint256 constant MINT_FEE = 0.02 ether;
  address s_feeCollector;
  Counters.Counter private s_tokenIds;

  mapping(uint256 => DataTypes.Snowman) private s_attributes;

  DataTypes.Accessory[] private s_accessories;
  mapping(address => bool) private s_accessoriesAvailable;

  // accessory address > snowman id > accessory id
  mapping(address => mapping(uint256 => uint256)) private s_accessoriesById;

  constructor(address feeCollector) ERC721("Snowman", "Snowman") {
    s_feeCollector = feeCollector;
  }

  function mint() public payable returns (uint256) {
    if (msg.value < MINT_FEE) revert Snowman__NotEnoughEth();

    s_tokenIds.increment();

    uint256 tokenId = s_tokenIds.current();
    _mint(msg.sender, tokenId);

    DataTypes.Snowman memory snowman;
    bytes3[2] memory colors;

    // generate random cloud and button color
    for (uint256 i = 0; i < 2; i++) {
      bytes32 randHash = keccak256(abi.encodePacked(i + 1, blockhash(block.number - 1), msg.sender, address(this)));
      colors[i] = bytes2(randHash[0]) | (bytes2(randHash[1]) >> 8) | (bytes3(randHash[2]) >> 16);
    }

    // generate random perspective
    uint256 randNum = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), msg.sender, address(this)))) % 20;

    snowman = DataTypes.Snowman({perspective: randNum + 328, cloudColor: colors[0], buttonColor: colors[1]});

    s_attributes[tokenId] = snowman;

    (bool success, ) = payable(owner()).call{value: msg.value}("");

    if (!success) revert Snowman__TransferFailed();

    return tokenId;
  }

  function addAccessory(address accessory, DataTypes.AccessoryPosition position) public onlyOwner {
    if (s_accessoriesAvailable[accessory]) revert Snowman__AcccessoryAlreadyExists();
    s_accessoriesAvailable[accessory] = true;
    s_accessories.push(DataTypes.Accessory(accessory, position));
  }

  function removeAccessory(address accessory, uint256 snowmanId) public {
    if (ownerOf(snowmanId) != msg.sender) revert Snowman__NotOwner();
    if (!hasAccessory(accessory, snowmanId)) revert Snowman__AccessoryNotWorn();

    _removeAccessory(accessory, snowmanId);
  }

  function removeAllAccessories(uint256 snowmanId) public {
    if (msg.sender != ownerOf(snowmanId)) revert Snowman__NotAccessoryOwner();

    DataTypes.Accessory[] memory accessories = s_accessories;

    // remove all accessories from snowman
    for (uint i = 0; i < accessories.length; i++) {
      if (s_accessoriesById[accessories[i]._address][snowmanId] > 0) {
        _removeAccessory(accessories[i]._address, snowmanId);
      }
    }
  }

  function _removeAccessory(address accessory, uint256 snowmanId) internal {
    Accessory(accessory).transferFrom(address(this), ownerOf(snowmanId), s_accessoriesById[accessory][snowmanId]);

    s_accessoriesById[accessory][snowmanId] = 0;
  }

  function hasAccessory(address accessory, uint256 snowmanId) public view returns (bool) {
    if (!s_accessoriesAvailable[accessory]) revert Snowman__UnavailableAccessory();

    return (s_accessoriesById[accessory][snowmanId] != 0);
  }

  function accessoryId(address accessory, uint256 snowmanId) external view returns (uint256) {
    if (!s_accessoriesAvailable[accessory]) revert Snowman__UnavailableAccessory();

    return s_accessoriesById[accessory][snowmanId];
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    if (!_exists(tokenId)) revert Snowman__NotMinted();

    DataTypes.Snowman memory snowman = s_attributes[tokenId];

    return SnowmanMetadata.tokenURI(s_accessories, s_accessoriesById, snowman, tokenId);
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
  ) external override returns (bytes4) {
    uint256 snowmanId = snowmanIdData.toUint256();

    if (ownerOf(snowmanId) != from) revert Snowman__NotAccessoryOwner();
    if (s_accessoriesAvailable[msg.sender] == false) revert Snowman__CannotWearAccessory();
    if (s_accessoriesById[msg.sender][snowmanId] > 0) revert Snowman__AccessoryAlreadyWorn();

    s_accessoriesById[msg.sender][snowmanId] = tokenId;

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

  function getAccessories() public view returns (DataTypes.Accessory[] memory) {
    return s_accessories;
  }

  function isAccessoryAvailable(address accessory) public view returns (bool) {
    return s_accessoriesAvailable[accessory];
  }
}

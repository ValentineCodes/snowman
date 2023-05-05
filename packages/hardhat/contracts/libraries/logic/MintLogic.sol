// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

import {DataTypes} from "../types/DataTypes.sol";

error Snowman__NotEnoughEth();
error Snowman__TransferFailed();

library MintLogic {
  using Counters for Counters.Counter;

  uint256 constant MINT_FEE = 0.02 ether;

  function mint(
    Counters.Counter storage s_tokenIds,
    mapping(uint256 => DataTypes.Snowman) storage s_attributes,
    address feeCollector
  ) external returns (uint256) {
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
}

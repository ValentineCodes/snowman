// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

error PRNG__InvalidRange(uint256 min, uint256 max);

library PRNG {
  modifier isValidRange(uint256 min, uint256 max) {
    if (min >= max) revert PRNG__InvalidRange(min, max);
    _;
  }

  function range(uint256 min, uint256 max) internal view isValidRange(min, max) returns (uint256) {
    uint256 exclusiveMax = (max - min) + 1;
    uint256 randNum = uint256(
      keccak256(abi.encodePacked(block.timestamp, blockhash(block.number - 1), msg.sender, address(this)))
    ) % exclusiveMax;

    return randNum + min;
  }

  function range(uint256 min, uint256 max, bytes32 seed) internal view isValidRange(min, max) returns (uint256) {
    uint256 exclusiveMax = (max - min) + 1;
    uint256 randNum = uint256(
      keccak256(abi.encodePacked(seed, block.timestamp, blockhash(block.number - 1), msg.sender, address(this)))
    ) % exclusiveMax;

    return randNum + min;
  }
}

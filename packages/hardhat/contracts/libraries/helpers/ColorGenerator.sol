// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library ColorGenerator {
  function generateHexColor(uint256 seed) internal view returns (bytes3) {
    bytes32 randHash = keccak256(abi.encodePacked(seed, blockhash(block.number - 1), msg.sender, address(this)));
    return bytes2(randHash[0]) | (bytes2(randHash[1]) >> 8) | (bytes3(randHash[2]) >> 16);
  }

  function generateHexColor() internal view returns (bytes3) {
    bytes32 randHash = keccak256(abi.encodePacked(blockhash(block.number - 1), msg.sender, address(this)));
    return bytes2(randHash[0]) | (bytes2(randHash[1]) >> 8) | (bytes3(randHash[2]) >> 16);
  }
}

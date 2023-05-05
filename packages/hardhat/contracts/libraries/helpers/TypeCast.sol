// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

error toUint256_OutOfBounds();

library TypeCast {
  function toColor(bytes3 value) internal pure returns (string memory) {
    bytes16 ALPHABET = "0123456789abcdef";
    bytes memory buffer = new bytes(6);
    for (uint256 i = 0; i < 3; i++) {
      buffer[i * 2 + 1] = ALPHABET[uint8(value[i]) & 0xf];
      buffer[i * 2] = ALPHABET[uint8(value[i] >> 4) & 0xf];
    }
    return string(buffer);
  }

  function toUint256(bytes memory _bytes) internal pure returns (uint256) {
    if (_bytes.length < 32) revert toUint256_OutOfBounds();
    uint256 tempUint;

    assembly {
      tempUint := mload(add(_bytes, 0x20))
    }

    return tempUint;
  }
}

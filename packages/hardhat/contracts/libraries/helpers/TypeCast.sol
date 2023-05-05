// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

error toUint256_OutOfBounds();

library TypeCast {
  function toUint256(bytes memory _bytes) internal pure returns (uint256) {
    if (_bytes.length < 32) revert toUint256_OutOfBounds();
    uint256 tempUint;

    assembly {
      tempUint := mload(add(_bytes, 0x20))
    }

    return tempUint;
  }
}

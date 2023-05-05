// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library DataTypes {
  enum AccessoryPosition {
    Front,
    Behind
  }

  struct Accessory {
    address _address;
    AccessoryPosition position;
  }

  struct Snowman {
    uint256 perspective;
    bytes3 cloudColor;
    bytes3 buttonColor;
  }
}

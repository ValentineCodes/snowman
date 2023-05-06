// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library DataTypes {
  enum AccessoryPosition {
    Foreground,
    Background
  }

  struct Accessory {
    address _address;
    AccessoryPosition position;
  }

  struct Snowman {
    uint256 perspective;
    string cloudColor;
    string buttonColor;
  }

  struct Hat {
    string color;
  }

  struct Scarf {
    string color;
  }

  struct Belt {
    string color;
  }
}

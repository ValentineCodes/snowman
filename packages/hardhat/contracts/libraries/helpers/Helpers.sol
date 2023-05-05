// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Base64} from "base64-sol/base64.sol";

library Helpers {
  function generateTokenURI(
    string calldata name,
    string calldata description,
    string calldata image
  ) internal pure returns (string memory) {
    return
      string(
        abi.encodePacked(
          "data:applicaton/json;base64,",
          Base64.encode(
            bytes(
              abi.encodePacked(
                '{"name": "',
                name,
                '", "description": "',
                description,
                '", "image": "data:image/svg+xml;base64,',
                image,
                "}"
              )
            )
          )
        )
      );
  }

  function generateTokenURI(
    string calldata name,
    string calldata description,
    string calldata image,
    string calldata attributes
  ) internal pure returns (string memory) {
    return
      string(
        abi.encodePacked(
          "data:applicaton/json;base64,",
          Base64.encode(
            bytes(
              abi.encodePacked(
                '{"name": "',
                name,
                '", "description": "',
                description,
                '", "image": "data:image/svg+xml;base64,',
                image,
                '", "attributes": ',
                attributes,
                "}"
              )
            )
          )
        )
      );
  }
}

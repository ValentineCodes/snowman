// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {DataTypes} from "../libraries/types/DataTypes.sol";
import {IERC721Enumerable} from "@openzeppelin/contracts/interfaces/IERC721Enumerable.sol";

interface ISnowman is IERC721Enumerable {
  event AccessoryAdded(address accessory);
  event AccessoriesAdded(address[] accessories);
  event AccessoryRemoved(address accessory);
  event AccessoriesRemoved(address[] accessories);

  function mint() external payable returns (uint256);

  function addAccessory(address accessory, DataTypes.AccessoryPosition position) external;

  function removeAccessory(address accessory, uint256 snowmanId) external;

  function removeAllAccessories(uint256 snowmanId) external;

  function hasAccessory(address accessory, uint256 snowmanId) external view returns (bool);

  function accessoryId(address accessory, uint256 snowmanId) external view returns (uint256);

  function tokenURI(uint256 tokenId) external view returns (string memory);

  function renderTokenById(uint256 tokenId) external view returns (string memory);

  function setFeeCollector(address newFeeCollector) external;

  function getFeeCollector() external view returns (address);

  function getAccessories() external view returns (DataTypes.Accessory[] memory);

  function isAccessoryAvailable(address accessory) external view returns (bool);
}

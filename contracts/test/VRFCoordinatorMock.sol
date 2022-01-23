//this is for the mock link token contract & mock chainlink VRF
//make sure you run npm install @chainlink/token AND add this version of solidity to hardhat.config


// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

//see https://github.com/smartcontractkit/hardhat-starter-kit/tree/main/contracts/test

import "@chainlink/contracts/src/v0.6/tests/VRFCoordinatorMock.sol";

//here is the contract: https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.6/tests/VRFCoordinatorMock.sol
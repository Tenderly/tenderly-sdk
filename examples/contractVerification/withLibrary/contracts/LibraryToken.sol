//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity 0.8.17;

import "./Library.sol";

contract LibraryToken {
  uint public dummyToken = 1;

  constructor() {
    dummyToken = 2;
  }

  function add(uint a, uint b) public pure returns (uint) {
    return Library.add(a, b);
  }
}

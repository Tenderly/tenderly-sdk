//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract HelloWorld {
  string public greeting;

  constructor(string memory _greeting) {
    greeting = _greeting;
  }

  function getGreeting() public view returns (string memory) {
    return greeting;
  }

  function setGreeting(string memory _greeting) public {
    greeting = _greeting;
  }
}

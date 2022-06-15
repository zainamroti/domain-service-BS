// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

import "hardhat/console.sol";

contract Domains {

    // A mapping to store user names;
    mapping(string => address) public domains;

    //A mapping to store values;
    mapping(string => string) public records;

  constructor() {
    console.log("THIS IS Nerd Domains CONTRACT. NICE.");
  }

// A register funciton that adds their names to our mapping

    function register(string calldata name) public {
        require(domains[name] == address(0), "Name is already registered");
        domains[name] = msg.sender;
        console.log("%s has registered a domain!",msg.sender);
    }

    // This will give us the domain owners' address
    function getAddress(string calldata name) public view returns (address) {
       //check that the owner is the trx sender.
        require(domains[name] == msg.sender, "Owner is not TRX Sender");
        return domains[name];
    }

    function setRecord(string calldata name, string calldata record) public {
         //check that the owner is the trx sender.
        require(domains[name] == msg.sender, "Owner is not TRX Sender");
        records[name] = record;
    }

    function getRecordd(string calldata name) public view returns(string memory) {
        return records[name];
    }


}
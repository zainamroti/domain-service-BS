// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

import { StringUtils } from "./libraries/StringUtils.sol";
import "hardhat/console.sol";

contract Domains {
    // Domain TLD!
    string public tld; // Top-Level-Domain like .eth or .nerd

    // A mapping to store user names;
    mapping(string => address) public domains;

    //A mapping to store values;
    mapping(string => string) public records;

  constructor(string memory _tld) payable {
    tld = _tld;
    console.log("%s name service deployed", _tld);
  }

    // get price of domain based on length
    function price(string calldata name) public pure returns(uint) {
        uint len = StringUtils.strlen(name);
        require(len > 0);
        if(len == 3) {
            return 5 * 10**16; // 5 MATIC = 5_000_000_000_000_000_000 (18 decimals). We're going with 0.05 Matic cause the faucets don't give a lot
        } else if (len == 4) {
            return 3 * 10**16; // To charge smaller amounts, reduce the decimals. This is 0.03 matic
        } else {
            return 1 * 10**16;
        }
    }


// A register funciton that adds their names to our mapping

    function register(string calldata name) public payable{
        require(domains[name] == address(0), "Name is already registered");

        uint _price = price(name);

        require(msg.value >= _price, "Not enough Matic paid");

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
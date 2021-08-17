pragma solidity ^0.8.0;


  /*  This contract variable definition pattern allows for arbitrary number
   *  of variable definition within child contracts without requiring
   *  new variable definition. This is useful for proxy structured contracts
   *  to prevent accidental data definitions and storage collisions (when a implementation
   *  contract attempts to write to an undefined varible within the context contract)
   *  while allowing flexibility of implementing new variables in subsequent
   *  contract upgrades.
   *
   *  Under this approach, variables should be defined in following pattern:
   *  _<variableType>[<variableName>] = <variableValue>
   *
   *  Example, "uint256 fee = 10" would be written "_uint256["fee"] = 10"
   */

contract Storage {

    // Elementary variables
    mapping(string => uint256) internal _uint256;
    mapping(string => int256) internal _int256;
    mapping(string => bool) internal _bool;
    mapping(string => bytes32) internal _bytes32;
    mapping(string => address) internal _address;
    mapping(string => string) internal _string;

    // Array variables
    mapping(string => uint256[]) internal _uint256Array;
    mapping(string => int256[]) internal _int256Array;
    mapping(string => bool[]) internal _boolArray;
    mapping(string => bytes32[]) internal _bytes32Array;
    mapping(string => address[]) internal _addressArray;
    mapping(string => string[]) internal _stringArray;

    // Mapping:Address variables
    mapping(string => mapping(address => uint256)) internal _uint256AddressMap;
    mapping(string => mapping(address => int256)) internal _int256AddressMap;
    mapping(string => mapping(address => bool)) internal _boolAddressMap;
    mapping(string => mapping(address => bytes32)) internal _bytes32AddressMap;
    mapping(string => mapping(address => address)) internal _addressAddressMap;
    mapping(string => mapping(address => string)) internal _stringAddressMap;

    // Mapping:String variables
    mapping(string => mapping(string => uint256)) internal _uint256StringMap;
    mapping(string => mapping(string => int256)) internal _int256StringMap;
    mapping(string => mapping(string => bool)) internal _boolStringMap;
    mapping(string => mapping(string => bytes32)) internal _bytes32StringMap;
    mapping(string => mapping(string => address)) internal _addressStringMap;
    mapping(string => mapping(string => string)) internal _stringStringMap;


}

pragma solidity ^0.8.0;


  /* This contract implments proxy contract pattern to allow for upgradability
   * of contract execution logic while maintaining the contract state.
   * This contract inherets a Storage contract to define the variables structure
   * to be used by both the proxy and implementation contract.
   */


   import "./Storage.sol";
   import "./Ownable.sol";

   contract UpgradableContract is Storage, Ownable {

     constructor(address implement) public {
       _address["Implementation"] = implement;
     }

     event NewImplementation(address indexed from, address indexed to);

     function updateImplementation(address newImplementation) external onlyOwner returns (bool) {
       _address["PrevImplementation"] = _address["Implementation"];
       _address["Implementation"] = newImplementation;

       emit NewImplementation(_address["PrevImplementation"], _address["Implementation"]);
     }

     /* Using delegatecall function we can make external calls to implementation contract while
      * using this proxy contract's state. This makes it possible for us to change the
      * execution logic while retaining all data (such as client balances!). Use of this pattern
      * requires we know implementation contract function signature at build time and subsequent
      * upgrade contracts must implement idential function signatures.
      */

      function delegateIncreaseBalance(uint increment) external {

        // First, we obtain the function signature via keccak256(“IncreaseBalance(uint)”)
        // Second, we store signature in first 4 bytes of calldata via bytes4. EVM will recognize this
        // as the function selector.
        // Third, we pass the arguments. In this case we only need to pass one argument: increment.
        // Fourth, we encode the data to hexadecimals via abi.encodePacked() to allow transmission over network.
        // First, we pass the call to call to our implementation contract via delegateCall opcode
        _address["Implementation"].delegateCall(abi.encodePacked(bytes4(keccak256(“IncreaseBalance(uint)”)), increment));
      }

     /* Using fallback function we can forward any function call to the implementation contract.
      * This allows us to implement new contracts with functions not known at proxy build time.
      * Low-level assembly is required to pass calldata to implementation contract.
      */

     fallback () external {
	      assembly {
            // 1. Forward remaining gas and calldata to Implementation address for execution using
            // delegatecall opcode. Hence, proxy contract state will be using in execution context
            let result := delegatecall(gas, _address["Implementation"], add(msg.data, 0x20), mload(msg.data), 0, 0)

            // 2. Store returned data from delegatecall
            let size := returndatasize
		        let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)

            // 3. Forward returned data to caller
		        switch result
		        case 0 {revert(ptr, size)}
		        default {return(ptr, size)}
	         }
     }

   }

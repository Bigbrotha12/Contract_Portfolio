pragma solidity ^0.8.0;


  /* This is a sample implementation contract that will receive calls from
   * a proxy contract. Contract inherets Storage contract data structure to
   * prevent storage collision. Therefore, local variables are not allowed.
   */

contract Implementation is Storage, Ownable {

  _bool["Initialized"] = false;
  _uint256["Balance"] = 0;

  // Initialization function takes the place of a constructor since contract
  // logic implemented inside a constructor is not retained within contract
  // bytecode. Initialization function should only run once and only once.
  function Initialization(address _owner) public {
    require(!_bool["Initialized"], "Contract already initialized");

    transferOwnership(_owner);
    _bool["Initialized"] = true;
  }

  function IncreaseBalance(uint amount) external returns(uint) {
    _uint256["Balance"] = _uint256["Balance"] + amount;
    return _uint256["Balance"];
  }

  function viewBalance() external view returns(uint) {
    return _uint256["Balance"];
  }

  function clearBalance() external {
    _uint256["Balance"] = 0;
  }

}

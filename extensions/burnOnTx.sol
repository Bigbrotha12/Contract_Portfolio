pragma solidity ^0.8.0

import "../Interfaces/IERC20.sol"
import "../contracts/Ownable.sol"

  /* Contract code snippet to add burn on transaction functionality to ERC20 contracts
   * Admin will define a burn percentage will be deducted from every transaction
   */

contract BurnOnTx.sol is IERC20, Ownable {

  uint8 private burnPct = 10;     // 10% of transaction amount to be burned
  mapping(address => uint256) private _balances;
  mapping(address => mapping(address => uint256)) private _allowances;

  uint256 private _totalSupply;

  string private _name;
  string private _symbol;

  function _burn(uint256 _amount) internal {
    _balances[msg.sender] = _balances[msg.sender] - _amount;
    _totalSupply = _totalSupply - _amount;
  }

  function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
    _beforeTransfer(address recipient, uint256 amount);
    uint256 burnable = amount * burnPct / 100;
    uint256 transferAmount = amount - burnable;

    _transfer(msg.sender, recipient, transferAmount);
    _burn(burnable);
    return true;
  }

  function transferFrom(
      address sender,
      address recipient,
      uint256 amount
  ) public virtual override returns (bool) {

      _beforeTransfer(sender, recipient, amount);

      uint256 currentAllowance = _allowances[sender][msg.sender];
      require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
      _approve(sender, msg.sender, currentAllowance - amount);

      _transfer(sender, recipient, amount);
      return true;
  }

  function _transfer(
      address sender,
      address recipient,
      uint256 amount
  ) internal virtual {

      uint256 senderBalance = _balances[sender];
      _balances[sender] = senderBalance - amount;
      _balances[recipient] += amount;

      emit Transfer(sender, recipient, amount);
  }

  function _beforeTransfer(address sender, address recipient, uint256 amount) internal {
    require(recipient != address(0), "ERC20: transfer to the zero address");
    require(sender != address(0), "ERC20: transfer from the zero address")
    require(_balances[msg.sender] >= amount, "ERC20: transfer amount exceeds balance");
  }

  function setBurnRate(uint8 _burnPct) external onlyOwner {
    require(_burnPct <= 100, "Burn percentage must be less than 100");
    burnPct = _burnPct;
  }


}

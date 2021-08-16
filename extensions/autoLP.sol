pragma solidity 0.8.0;

import "../Interfaces/IERC20.sol";
import "../Interfaces/IUniswapV2Factory.sol";
import "../Interfaces/IUniswapV2Router.sol";
import "../Interfaces/IUniswapV2Pair.sol";
import "../contracts/Ownable.sol";


contract AutoLP is IERC20, Ownable {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    address private immutable routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    IUniswapV2Router private immutable router02 = IUniswapV2Router(routerAddress);
    address private PairAddress;
    uint256 private minTokenforLP;
    bool private inSwap = false;

    constructor(string memory name_, string memory symbol_, uint256 initSupply) {
        _name = name_;
        _symbol = symbol_;
        _totalSupply = initSupply*(10**18));
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);

        // create Uniswap Pair contracts
        PairAddress = IUniswapV2Factory(router02.factory())
            .createPair(address(this), router02.WETH());
    }

    //Allows contract to receive ETH
    receive() external payable {}

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {

      // _beforeTransfer contains requirements prior to transfer
        _beforeTransfer(sender, recipient, amount);

        uint256 LPfee = amount * 10 / 100;   // 10% for liquidity pool
        uint256 toTransfer = amount - LPfee;
        takeLiquidity(LPfee);
        _transfer(msg.sender, recipient, toTransfer);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {

        // _beforeTransfer contains requirements prior to transfer
        _beforeTransfer(sender, recipient, amount);

        // check if this is a contract-related transfer for adding liquidity or
        // user transfer
        if(!inSwap) {
          uint256 toTransfer = amount - LPfee;
          takeLiquidity(LPfee);
          _transfer(msg.sender, recipient, toTransfer);
        } else {
          _transfer(sender, recipient, amount);
        }

        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        unchecked {
            _approve(sender, msg.sender, currentAllowance - amount);
        }

        return true;
    }

    function takeLiquidity(uint256 _LPfee) private {

      //check if we have enough tokens for swap/addLiquidity
      uint256 contractTokenBalance = balanceOf(address(this));
      if(contractTokenBalance < minTokenforLP) {
        holdLP(_LPfee);
      } else {
        addLP(contractTokenBalance);
      }
    }

    function addLP(uint256 balance) private {
      // Break LPfee balance into two halves. One half to be converted to ETH
      uint256 half = balance / 2;
      uint256 remainder = balance - half;
      uint256 receivedETH = getETH(half);

      // Prevent liquidity provision loop
      inSwap = true;

      router02.addLiquidityETH {value: receivedETH}(
        address(this),
        remainder,
        0,
        0,
        address(this),
        block.timestamp
        )

        inSwap = false;
    }

    function holdLP(uint256 _LPfee) private {
      _balances[address(this)] = _balances[address(this)] + _LPfee;
    }

    function getETH(uint256 amount) private returns(uint256){
      uint256 initialBalance = address(this).balance;

      // make the swap
       _approve(address(this), routerAddress, amount);
       address[] memory path = new address[](2);
       path[0] = address(this);
       path[1] = router02.WETH();

       // Prevent liquidity provision loop
       inSwap = true;

       router02.swapExactTokensForETHSupportingFeeOnTransferTokens(
         amount,          // number of tokens to swap
         0,               // minumum amount of ETH required, any amount
         path,            // token pair path as array of token address
         address(this),   // contract to hold LP tokens
         block.timestamp  // deadline, 1 block
         );

         inSwap = false;

      uint256 endingBalance = address(this).balance;

      return (initialBalance - endingBalance);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual {

        _balances[sender] = _balances[sender] - amount;
        _balances[recipient] = _balances[recipient] + amount;

        emit Transfer(sender, recipient, amount);
    }

  }

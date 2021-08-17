pragma solidity ^0.8.0;

  /* Implementation based on OpenZeppelin smart contract library.
   * Contract requires token interface for the token being sold. See
   * IERC20.sol for sample.
   */

contract Crowdsale is ITokenContract {

  address private wallet;
  uint256 private rate;
  uint256 private maxCap = 10000 * 10**18;
  uint256 private deadline;
  mapping(address => uint256) private tokenAllocation;
  ITokenContract private token;

  constructor(uint256 _rate, address payable _wallet, address _token) public {
    token = ITokenContract(_token);
    wallet = _wallet;
    rate = _rate;
    deadline = block.timeStamp + 900000000; // contract open for 10 days

  }

  event TokensPurchased(address indexed purchaser, address indexed beneficiary, uint value, uint amount);

  fallback() external payable {}

  function token() public view returns(address) {
    return(token);
  }

  function wallet() public view returns(address) {
    return(wallet);
  }

  function rate() public view returns(uint256) {
    return(rate);
  }

  function weiRaised() public view returns(uint256) {
    return(address(this).balance);
  }

  function buyTokens(address beneficiary) payable public {
    uint256 weiAmount = weiRaised();
    _preValidatePurchase(beneficiary, weiAmount);

    tokenAllocation[beneficiary] = 100;   // hard-coded values for demo-only

    _postValidatePurchase(beneficiary, weiAmount);
    _deliverTokens(beneficiary, tokenAllocation[beneficiary]);

    emit TokensPurchased(msg.sender, beneficiary, rate, tokenAllocation[beneficiary]);
  }

  function _preValidatePurchase(address beneficiary, uint weiAmount) internal {
    require(weiAmount < maxCap, "Crowdsale target already met");
    require(beneficiary != address(0), "Zero address cannot be beneficiary");
    require(msg.value == rate);
    require(tokenAllocation[beneficiary] == 0, "Beneficiary already participated");
  }

  function _postValidatePurchase(address beneficiary, uint weiAmount) internal {
    assert(tokenAllocation[beneficiary] == 100);
  }

  function _deliverTokens(address beneficiary, uint tokenAmount) internal {
    token.transfer(beneficiary, tokenAmount);   // Crowdsale must hold tokens
  }

  function _processPurchase(address beneficiary, uint tokenAmount) {

  }

  function _updatePurchasingState(address beneficiary, uint weiAmount) {

  }

  function _getTokenAmount(uint weiAmount) {

  }

  function _forwardFunds() external {
    require(block.timeStamp >= deadline, "Cannot withdraw yet");
    uint256 amount = weiRaised();
    wallet.send{value: amount}();
  }
}

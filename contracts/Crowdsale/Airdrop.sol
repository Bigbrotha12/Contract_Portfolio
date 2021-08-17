pragma solidity ^0.8.0;

  /*  Simple airdrop contract will take array of addresses and distribute tokens
   *  to beneficiaries. Distribution can be done at standard rate or individualized
   *  rate per beneficiary address. Care must be taken to estimate gas prior to
   *  running airdrop to prevent hitting gas limits. Airdrop should be Ownable
   */

   import "../Library/Ownable.sol";


contract Airdrop is IToken, Ownable {

  address[] private beneficiary;
  uint256[] private payout;
  uint256 private tokenAmount;
  IToken private token;

  constructor(
    address[] _beneficiaries,
    uint256[] _payout,
    uint256 _tokenAmount,
    address _token
    ) public {

    beneficiary = _beneficiaries
    payout = _payout
    tokenAmount = _tokenAmount
    token = IToken(_token);
  }

  function deliverPayout() public onlyOwner {

    for(uint i=0; i < beneficiary.length; i++){
      token.transfer(beneficiary[i], payout[i]);
    }

  }

  function deliverToken() public onlyOwner {

    for(uint i=0; i < beneficiary.length; i++){
      token.transfer(beneficiary[i], tokenAmount);
    }
  }

}

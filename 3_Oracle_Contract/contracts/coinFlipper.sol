// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../../node_modules/@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "../../node_modules/@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

/// @title CoinFlipper
/// @notice Operates a coin-flipping gambling game using Chainlink
/// @notice VRF Oracle as source of randomness.
contract CoinFlipper is Ownable, VRFConsumerBaseV2 {

    VRFCoordinatorV2Interface COORDINATOR;              // Chainlink coordinator interface
    uint64 subscriptionId;                              // Chainlink account
    uint256 private pot;                                // Contract balance
    uint256 private committedPot;                       // Balance of pot claimable by players
    mapping(uint256 => address) private playerQuery;    // Oracle query for each player
    mapping(address => uint) private playerOutcome;     // Win/loss outcome for each player
    mapping(address => uint) private playerBalance;     // Bet placed by each player
    mapping(address => bool) private awaitingQuery;     // Players awaiting response from oracle
    
    event betPlaced(
      address indexed _from, 
      uint256 _amount
    );                                                  // Emitted after player places bet
    event logNewQuery(
      address indexed _player,
      uint256 _id
    );                                                  // Emitted after each oracle query is sent
    event randomNumber(
      uint256 indexed _id, 
      uint256 _result
    );                                                  // Emitted after oracle responds

    constructor(uint64 _subscriptionId, address _vrfCoordinator) VRFConsumerBaseV2(_vrfCoordinator) {
    COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
    subscriptionId = _subscriptionId;
    }
    
    /// @notice Allow player to place a bet of atleast 0.1 ETH.
    /// @dev Player cannot change bet while waiting for oracle response.
    /// @dev Balance to be added to be determined by transaction value.
    function placeBet() external payable {
      require(msg.value >= 0.1 ether, "CoinFlipper: Minimum bet is 0.1 ETH");
      require(!awaitingQuery[msg.sender], "CoinFlipper: Coin flip in progress");

      playerBalance[msg.sender] += msg.value;
      pot += msg.value;
      committedPot += msg.value;

      emit betPlaced(msg.sender, msg.value);
    }

    /// @notice Issues query to oracle for a random number.
    /// @dev User must have placed bet of atleast 0.1 ether and cannot make another 
    /// @dev request while awaiting query.
    function startCoinFlip() external payable {
      require(playerBalance[msg.sender] <= ((pot - committedPot) / 2),"CoinFlipper: Insufficient balance to cover bet");
      require(playerBalance[msg.sender] >= 0.1 ether, "CoinFlipper: Bet required");
      require(!awaitingQuery[msg.sender],"CoinFlipper: Previous coin flip still pending");

      awaitingQuery[msg.sender] = true;
      committedPot += playerBalance[msg.sender];         //Reserve pot balance in case player wins.
      assert(pot >= committedPot);

      bytes32 keyHash =                                  // Chainlink gas lane
        0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15; 
      uint16 requestConfirmations = 3;                   // Delay before oracle executes query.
      uint32 callbackGasLimit = 200000;                  // Gas needed for oracle callback transaction.
      uint32 numberRequired = 1;                         // Number of random numbers requested.        
      uint256 queryId = COORDINATOR.requestRandomWords(
        keyHash,
        subscriptionId,
        requestConfirmations,
        callbackGasLimit,
        numberRequired
      );
      playerQuery[queryId] = msg.sender;
        
      emit logNewQuery(msg.sender, queryId);
    }

    /// @notice Oracle callback function with response. Determine the win/lose 
    /// @notice result for the given player.
    /// @param _queryId of request being answered.
    /// @param _randomWords resulting random numbers.
    function fulfillRandomWords(uint256 _queryId, uint256[] memory _randomWords) internal override {
      address player = playerQuery[_queryId];            // Player who called this query.
      require(awaitingQuery[player]);
      
      uint256 result = _randomWords[0] % 2;     
      playerOutcome[player] = result;
      emit randomNumber(_queryId, result);

      uint256 outcome = playerOutcome[player];
      if(outcome == 1) {
        playerBalance[player] *= 2;
      }
      else {
        committedPot -= (playerBalance[player]*2);
        playerBalance[player] = 0;
      }
      awaitingQuery[player] = false;
    } 
      
    /// @notice Allows player to withdraw their winnings from the contracts pot.
    /// @notice Amount to be withdrawn must be less than or equal to the player's balance.
    /// @notice Players may not withdraw bet while awaiting for Oracle query.
    /// @param _amount is ether value to be paid to player.
    function payOut(uint _amount) external {
      require(_amount <= playerBalance[msg.sender]);
      require(!awaitingQuery[msg.sender]);

      playerBalance[msg.sender] -= _amount;
      pot -= _amount;
      committedPot -= _amount;

      payable(msg.sender).transfer(_amount);
    }

    /// @notice Getter function for player's current ether balance.
    function getBalance() public view returns(uint256){
      return playerBalance[msg.sender];
    }

    /// @notice Getter function to obtain current balance of contract.
    function getPot() public view returns (uint256){
      return pot;
    }

    /// @notice Getter function to obtain current balance of contract claimable by players.
    function getCommitedPot() public view returns (uint256){
      return committedPot;
    }

    /// @notice Adds ether balance to the contract.
    function addPot() external payable onlyOwner {
      pot += msg.value;
    }

    /// @notice Removes ether balance from the contract not claimable by players.
    /// @param _amount is balance to be withdrawn from contract.
    function removePot(uint _amount) external onlyOwner {
      require(_amount <= (pot - committedPot));

      pot -= _amount;

      payable(msg.sender).transfer(_amount);
    }

    /// @notice Unlocks player funds in case of oracle failure.
    /// @param _player address impacted by oracle failure.
    /// @param _queryId failed query to be eliminated.
    function unlockPlayer(address _player, uint256 _queryId) external onlyOwner {
       awaitingQuery[_player] = false;
       playerQuery[_queryId] = address(0);
    }
}

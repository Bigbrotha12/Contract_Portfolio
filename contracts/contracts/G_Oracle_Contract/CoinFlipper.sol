// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "./../A_DemoToken/DemoToken.sol";

struct Player {
    uint256 balance;
    bool awaitingQuery;
}

/// @title CoinFlipper
/// @notice Operates a coin-flipping gambling game using Chainlink
/// @notice VRF Oracle as source of randomness.
contract CoinFlipper is Ownable, VRFConsumerBaseV2 {
    //------------------ STATE VARIABLES ---------------------------------------

    VRFCoordinatorV2Interface COORDINATOR; // Chainlink coordinator interface
    LinkTokenInterface LINK;
    uint64 public subscriptionId; // Chainlink account
    bytes32 public keyHash;

    uint256 public reservedBalance; // Contract balance reserved for players
    mapping(uint256 => address) public playerQuery; // Oracle query for each player
    mapping(address => Player) public players; // Players data
    DemoToken public token;
    

    //----------------------- EVENTS -------------------------------------------

    event betPlaced(address indexed _from, uint256 _amount); // Emitted after player places bet
    event betPaidOut(address indexed _to, uint256 _amount); // Emitted after player withdraws balance
    event logNewQuery(address indexed _player, uint256 _id); // Emitted after each oracle query is sent
    event randomNumber(uint256 indexed _id, uint256 _result); // Emitted after oracle responds
    event fundsReceived(address indexed _sender, uint256 _amount); // Emitted after receiving funding

    //--------------------  CONSTRUCTOR ----------------------------------------

    /// @notice Requires chainlink subscription to be set-up prior to contract
    /// @notice deployment. Contract will auto-subscribe as VRF consumer.
    /// @param _vrfCoordinator      Address of Chainlink oracle coordinator
    /// @param _token               Token for demonstration purposes
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        LinkTokenInterface _linkToken,
        DemoToken _token
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        LINK = _linkToken;
        keyHash = _keyHash;
        token = _token;
        subscribe();
    }

    //------------------------ VIEWS -------------------------------------------

    /// @notice Returns player's current ether balance.
    function getPlayerBalance(address _player) public view returns (uint256) {
        return players[_player].balance;
    }

    /// @notice Returns current balance of contract.
    function getBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    /// @notice Returns current balance of contract claimable by players.
    function getReservedBalance() public view returns (uint256) {
        return reservedBalance;
    }

    //-------------------- MUTATIVE FUNCTIONS ----------------------------------

    function setToken(DemoToken _token) external onlyOwner {
        token = _token;
    }

    function subscribe() public onlyOwner {
        subscriptionId = COORDINATOR.createSubscription();
        COORDINATOR.addConsumer(subscriptionId, address(this));
    }

    /// Requires Chainlink deposited to contract.
    function fundOracle(uint256 amount) public onlyOwner { 
        LINK.transferAndCall(
            address(COORDINATOR),
            amount,
            abi.encode(subscriptionId)
        );
    }

    function unsubscribe() public onlyOwner {
        COORDINATOR.removeConsumer(subscriptionId, address(this));
        COORDINATOR.cancelSubscription(subscriptionId, msg.sender);
        subscriptionId = 0;
    }

    /// @notice Allow player to place a bet of atleast 0.1 ETH.
    /// @dev Player cannot change bet while waiting for oracle response.
    /// @dev Balance to be added to be determined by transaction value.
    function placeBet(uint256 _amount) external {
        require(_amount >= 1, "CoinFlipper: Minimum bet is 1 DEMO");
        require(
            token.balanceOf(msg.sender) >= _amount,
            "CoinFlipper: Insufficient funds"
        );
        require(
            !players[msg.sender].awaitingQuery,
            "CoinFlipper: Coin flip in progress"
        );

        token.burnFrom(msg.sender, _amount);

        players[msg.sender].balance += _amount;
        reservedBalance += _amount;

        emit betPlaced(msg.sender, _amount);
    }

    /// @notice Allows player to withdraw their winnings from the contracts.
    /// @notice Amount to be withdrawn must be less than or equal to the player's balance.
    /// @notice Players may not withdraw bet while awaiting for Oracle query.
    /// @param _amount ether value to be paid to player.
    function payOut(uint _amount) external {
        require(
            _amount <= players[msg.sender].balance,
            "CoinFlipper: Invalid withdraw amount"
        );
        require(
            !players[msg.sender].awaitingQuery,
            "CoinFlipper: Coin flip in progress"
        );

        players[msg.sender].balance -= _amount;
        reservedBalance -= _amount;

        token.mintTo(msg.sender, _amount);

        emit betPaidOut(msg.sender, _amount);
    }

    /// @notice Issues query to oracle for a random number.
    /// @dev User must have placed bet of atleast 0.1 ether and cannot make another
    /// @dev request while awaiting query.
    function startCoinFlip() external {
        require(
            !players[msg.sender].awaitingQuery,
            "CoinFlipper: Coin flip in progress"
        );
        uint256 bet = players[msg.sender].balance;
        require(bet >= 1, "CoinFlipper: Bet required");

        players[msg.sender].awaitingQuery = true;
        reservedBalance += bet; //Reserve balance in case player wins.

        // Chainlink query parameters
        uint16 requestConfirmations = 3; // Delay before oracle executes query.
        uint32 callbackGasLimit = 200000; // Gas needed for oracle callback transaction.
        uint32 numberRequired = 1; // Number of random numbers requested.
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
    /// @dev Ensure no external calls are made in fullfilment of query
    /// @param _queryId of request being answered.
    /// @param _randomWords resulting random numbers.
    function fulfillRandomWords(
        uint256 _queryId,
        uint256[] memory _randomWords
    ) internal override {
        address player = playerQuery[_queryId];
        require(
            players[player].awaitingQuery,
            "CoinFlipper: Unsolicited query"
        ); // Prevent fulfillment of invalid or cancelled queries

        uint256 result = _randomWords[0] % 2;
        uint256 balance = players[player].balance;
        if (result == 1) {
            players[player].balance = (balance * 2);
        } else {
            reservedBalance -= (balance * 2);
            players[player].balance = 0;
        }
        players[player].awaitingQuery = false;

        emit randomNumber(_queryId, result);
    }
}

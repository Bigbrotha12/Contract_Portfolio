// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import {DemoToken} from "./../A_ERC20/DemoToken.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title CoinFlipper
/// @author Rafael Mendoza
/// @notice Operates a coin-flipping gambling game using Chainlink VRF Oracle network as source of randomness.
/// @dev Contract operates as owner of its own subscription with auto-subscribe and unsubscribe capabilities.
contract CoinFlipper is Ownable, VRFConsumerBaseV2 {

    struct Player {
        uint256 balance;
        bool awaitingQuery;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    uint256 public constant MINIMUM_BET = 1e18;
    uint16 private constant CONFIRMATIONS = 3;
    uint32 private constant GAS_LIMIT = 200000;
    uint32 private constant WORD_REQUESTED = 1;
    VRFCoordinatorV2Interface public immutable i_coordinator;
    LinkTokenInterface public immutable i_link;
    bytes32 public immutable i_keyHash;
    uint64 public s_subscriptionId;
    uint256 public s_reservedBalance;
    mapping(uint256 queryId => address player) public s_playerQuery;
    mapping(address user => Player data) public s_players;
    DemoToken public s_token;
    
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    event BetPlaced(address indexed _from, uint256 _amount);
    event BetPaidOut(address indexed _to, uint256 _amount);
    event LogNewQuery(address indexed _player, uint256 _id);
    event RandomNumber(uint256 indexed _id, uint256 _result);
    event FundsReceived(address indexed _sender, uint256 _amount);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 ERRORS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    error CoinFlipper__MissingSubscription();
    error CoinFlipper__InsufficientBetAmount(uint256 amount, uint256 minimum);
    error CoinFlipper__AwaitingOracleResponse();
    error CoinFlipper__InvalidQuery(uint256 id);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /// @notice Requires chainlink subscription to be set-up prior to contract deployment. Contract will auto-subscribe 
    /// @notice as VRF consumer.
    /// @param _vrfCoordinator Address of Chainlink oracle coordinator
    /// @param _token Token for demonstration purposes
    constructor(
        address _vrfCoordinator, 
        bytes32 _keyHash, 
        LinkTokenInterface _linkToken, 
        DemoToken _token
    ) 
    VRFConsumerBaseV2(_vrfCoordinator) 
    Ownable(msg.sender)
    {
        i_coordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        i_link = _linkToken;
        i_keyHash = _keyHash;
        s_token = _token;
        subscribe();
    }

    /// @notice Allows contract owner to change Demo Token to be used for test.abi
    /// @param _token address of new token conforming to the DemoToken interface.
    function setToken(DemoToken _token) external onlyOwner {
        s_token = _token;
    }

    /// @notice Create new subscription with oracle coordinator and adds itself as consumer.
    function subscribe() public onlyOwner {
        s_subscriptionId = i_coordinator.createSubscription();
        i_coordinator.addConsumer(s_subscriptionId, address(this));
    }

    /// @notice Funds the subscription account with LINK tokens.
    /// @dev Requires Chainlink deposited to contract.
    function fundOracle() public onlyOwner { 
        uint64 subscription = s_subscriptionId;
        if(subscription == 0) revert CoinFlipper__MissingSubscription();

        uint256 amount = i_link.balanceOf(address(this));

        i_link.transferAndCall(address(i_coordinator), amount, abi.encode(subscription));
    }

    /// @notice Removes contract as oracle consumer and remove subscription
    function unsubscribe() public onlyOwner {
        uint64 subscription = s_subscriptionId;
        i_coordinator.removeConsumer(subscription, address(this));
        i_coordinator.cancelSubscription(subscription, msg.sender);
        s_subscriptionId = 0;
    }

    /// @notice Allow player to place a bet of atleast 1 DEMO.
    /// @dev Player cannot change bet while waiting for oracle response. Balance to be added to be determined by 
    /// @dev transaction value.
    /// @param _amount number of tokens to be deposited to contract
    function placeBet(uint256 _amount) external {
        if(_amount < MINIMUM_BET) revert CoinFlipper__InsufficientBetAmount(_amount, MINIMUM_BET);
        if(s_players[msg.sender].awaitingQuery) revert CoinFlipper__AwaitingOracleResponse();
    
        s_token.burnFrom(msg.sender, _amount);
        s_players[msg.sender].balance += _amount;
        s_reservedBalance += _amount;

        emit BetPlaced(msg.sender, _amount);
    }

    /// @notice Allows player to withdraw their winnings from the contracts. 
    /// @notice Players may not withdraw bet while awaiting for Oracle query.
    function payOut() external {
        if(s_players[msg.sender].awaitingQuery) revert CoinFlipper__AwaitingOracleResponse();

        uint256 amount = s_players[msg.sender].balance;
        s_players[msg.sender].balance = 0;
        s_reservedBalance -= amount;
        s_token.mintTo(msg.sender, amount);

        emit BetPaidOut(msg.sender, amount);
    }

    /// @notice Issues query to oracle for a random number.
    /// @dev User must have placed bet of atleast 0.1 ether and cannot make another request while awaiting query.
    function startCoinFlip() external {
        if(s_players[msg.sender].awaitingQuery) revert CoinFlipper__AwaitingOracleResponse();
        uint256 bet = s_players[msg.sender].balance;
        if(bet < MINIMUM_BET) revert CoinFlipper__InsufficientBetAmount(bet, MINIMUM_BET);

        s_players[msg.sender].awaitingQuery = true;
        s_reservedBalance += bet;

        // Chainlink query
        uint256 queryId = i_coordinator.requestRandomWords(
            i_keyHash,
            s_subscriptionId,
            CONFIRMATIONS,
            GAS_LIMIT,
            WORD_REQUESTED
        );
        s_playerQuery[queryId] = msg.sender;

        emit LogNewQuery(msg.sender, queryId);
    }

    /// @notice Oracle callback function with response. Determine the win/lose result for the given player.
    /// @dev Ensure no external calls are made in fullfilment of query
    /// @param _queryId of request being answered.
    /// @param _randomWords resulting random numbers.
    function fulfillRandomWords(uint256 _queryId, uint256[] memory _randomWords) internal override {
        address player = s_playerQuery[_queryId];
        // Prevent fulfillment of invalid or cancelled queries
        if(!s_players[player].awaitingQuery) revert CoinFlipper__InvalidQuery(_queryId);
 
        uint256 result = _randomWords[0] % 2;
        uint256 balance = s_players[player].balance;
        if (result == 1) {
            s_players[player].balance = (balance * 2);
        } else {
            s_reservedBalance -= (balance * 2);
            s_players[player].balance = 0;
        }
        s_players[player].awaitingQuery = false;

        emit RandomNumber(_queryId, result);
    }

        /// @notice Returns player's current ether balance.
    function getPlayerBalance(address _player) public view returns (uint256) {
        return s_players[_player].balance;
    }

    /// @notice Returns current balance of contract.
    function getBalance() public view returns (uint256) {
        return s_token.balanceOf(address(this));
    }

    /// @notice Returns current balance of contract claimable by players.
    function getReservedBalance() public view returns (uint256) {
        return s_reservedBalance;
    }
}

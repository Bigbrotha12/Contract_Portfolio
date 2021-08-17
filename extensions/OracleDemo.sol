pragma solidity ^0.8.0

  /*  This contract interfaces with Chainlink and Band oracles on Ethereum
   *  Mainnet and displays coding pattern for requesting and utilizing
   *  on-chain oracle data in any smart contract.
   */

import "../Interfaces/BandReferenceData.sol";
import "../Interfaces/AggregatorV3Interface.sol";
import "../Interfaces/VRFConsumerBase.sol";
import "../Interfaces/ChainlinkClient.sol";

contract OracleDemo is IStdReference, AggregatorV3Interface, VRFConsumerBase, ChainlinkClient {
  using Chainlink for Chainlink.Request;

  /* Band protocol offers the StdReference contract which exposes two function:
   * getReferenceData and getReferenceDataBulk. getReferenceData provides
   * quotes for a token pair while getReferenceDataBulk provides quotes for
   * an array of token pairs. Here we only focus on getReferenceData.
   *
   *  - Band Contract Location -
   *  BSC (testnet): 0xDA7a001b254CD22e46d3eAB04d937489c93174C3
   *  BSC (mainnet): 0xDA7a001b254CD22e46d3eAB04d937489c93174C3
   *  Ethereum (Kovan): 0xDA7a001b254CD22e46d3eAB04d937489c93174C3
   *  Ethereum (Mainnet): 0xDA7a001b254CD22e46d3eAB04d937489c93174C3
   */

   IStdReference immutable private bandFeed = IStdReference("0xDA7a001b254CD22e46d3eAB04d937489c93174C3");

   function getBandPrice() external view returns (uint256){
        IStdReference.ReferenceData memory data = bandFeed.getReferenceData("BTC","USD");
        return data.rate;
    }

    /* Chainlink price feed oracles work in a different way. Each token pair
     * price query must be forwarded to that token pairs individual contract.
     * For a list of available token pair contracts, see https://docs.chain.link/docs/ethereum-addresses/
     * In this example we use BTC / USD pair address (0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c)
     */

   AggregatorV3Interface private linkFeed = AggregatorV3Interface("0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c");

     function getLinkPrice() public view returns (int) {
        (
            uint80 roundID,
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = linkFeed.latestRoundData();
        return price;
    }

    /* Chainlink also offers a Verifiable Random Function (VRF) number generator
     * useful for blockchain games where an element of randomness is required.
     * To access this function we must define the following variables:
     * LINK Token - LINK token address on the corresponding network (Ethereum, Polygon, BSC, etc)
     * VRF Coordinator - address of the Chainlink VRF Coordinator
     * Key Hash - public key against which randomness is generated
     * Fee - fee required to fulfill a VRF request
     *
     * For Ethereum (mainnet), the required values are:
     * LINK Token: 0x514910771AF9Ca656af840dff83E8264EcF986CA
     * VRF Coordinator: 0xf0d54349aDdcf704F77AE15b96510dEA15cb7952
     * Key Hash: 0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445
     * Fee: 2 LINK
     */

     bytes32 internal keyHash;
     uint256 internal fee;

     uint256 public randomResult;

     constructor() VRFConsumerBase(
       "0xf0d54349aDdcf704F77AE15b96510dEA15cb7952",  // vrfCoordinator
       "0x514910771AF9Ca656af840dff83E8264EcF986CA"   // LINK token contract
       ) public {
         keyHash = "0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445"
         key = 2 * 10**18
       }

     function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee);
    }

     // Callback function that will be called by Oracle to send response.
     // function has a gas limit of 200k gas, otherwise it will revert.
     function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
    }

    /*  Lastly, Chainlink makes it possible to make GET API request to off-chain data endpoints.
     *  You can find custom data sources in Chainlink market: https://market.link/
     *  Here we show how to make simple HTTP GET request to an API within smart contract.
     *  We need to inheret ChainlinkClient contract which exposes a struct called
     *  "Chainlink.request" which we will use to build API query. To build this query
     *  we need to provide:
     *  Oracle address
     *  Job id
     *  Fee
     *  Adapter parameters
     *  Callback function signature.
     *
     *  Callback response will be 32 bytes maximum. If data received is larger then
     *  we will need multiple requests. For more information see Chainlink
     *  documentation: https://docs.chain.link/docs/make-a-http-get-request/
     *  Hardcoded values used for Demo purposes only
     */

     address private oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
     bytes32 private jobId = "d5270d1c311941d0b08bead21fea7747";
     uint256 private fee = 0.1 * 10 ** 18;

     uint256 private volume;

     function requestVolumeData() public returns (bytes32 requestId)
    {
      Chainlink.Request memory request = buildChainlinkRequest(
        jobId,                    // jobID identifies data request type
        address(this),            // our contract's address for callback
        this.fulfill.selector);   // Callback function signature

      // Performs to API GET request to provided URL
      request.add("get", "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD");

      // Sample response
      // Set the path to find the desired data in the API response, where the response format is:
      // {"RAW":
      //   {"ETH":
      //    {"USD":
      //     {
      //      "VOLUME24HOUR": xxx.xxx,
      //     }
      //    }
      //   }
      //  }
      request.add("path", "RAW.ETH.USD.VOLUME24HOUR");

      // Multiply the result by 1000000000000000000 to remove decimals
      int timesAmount = 10**18;
      request.addInt("times", timesAmount);

      // Sends the request
      return sendChainlinkRequestTo(oracle, request, fee);
    }

      // Callback function the oracle will use to send responses
      function fulfill(bytes32 _requestId, uint256 _volume) public recordChainlinkFulfillment(_requestId)
    {
        volume = _volume;
    }

}

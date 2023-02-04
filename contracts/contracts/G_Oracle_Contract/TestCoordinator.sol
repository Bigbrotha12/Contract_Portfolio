// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface VRFConsumerBase {
  function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external;
}

contract TestCoordinator {

  uint256[] public result;
  mapping(uint64 => mapping(address => bool)) isConsumer;

  function answerTestQuery(uint256 _queryId, uint256 _desiredResult, address _target) external {
    VRFConsumerBase target = VRFConsumerBase(_target);
    if(result.length > 0){
      result[0] = _desiredResult; 
    } else {
      result.push(_desiredResult);
    }
    
    target.rawFulfillRandomWords(_queryId, result);
  }

  function requestRandomWords(bytes32 keyHash,uint64 subId,uint16 minimumRequestConfirmations,uint32 callbackGasLimit,uint32 numWords) external view returns (uint256 requestId) {
    require(isConsumer[subId][msg.sender], "Error: Not a registered consumer.");
    keyHash; subId; minimumRequestConfirmations; callbackGasLimit; numWords;
    return 500;
  }

  function createSubscription() external pure returns (uint256) {
    return 1;
  }

  function addConsumer(uint64 _id, address _consumer) external {
    isConsumer[_id][_consumer] = true;
  }

}
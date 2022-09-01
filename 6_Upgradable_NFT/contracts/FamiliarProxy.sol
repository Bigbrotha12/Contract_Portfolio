// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./CommonStorage.sol";

contract FamiliarProxy is Proxy, CommonStorage {

    constructor(address[] memory _routingConfig) {
        admin = _routingConfig[0];
        callRouting[_routingConfig[0]] = _routingConfig[1];
        imx = _routingConfig[2];
        callRouting[_routingConfig[2]] = _routingConfig[3];
        callRouting[address(0)] = _routingConfig[4];
        version[_routingConfig[4]] = "1.0.0";
    }

    function getVersion() external ifAdmin returns (string memory) {
        return version[callRouting[address(0)]];
    }

    function changeRouting(address _sender, address _target) external ifAdmin {
        callRouting[_sender] = _target;
    }

    function upgradeAndInit(IERC165 _impl, bytes[] calldata _initData) external ifAdmin {
        require(!initializing, "Proxy: Initialization in progress");
        bool validTarget = 
            _impl.supportsInterface(0xcca9cbe6) && 
            _impl.supportsInterface(0x80ac58cd) && 
            _impl.supportsInterface(0x5b5e139f);
        require(validTarget, "Proxy: Invalid upgrade target");

        initializing = true;
        callRouting[address(0)] = address(_impl);
        version[address(_impl)] = string(_initData[0]);

        (bool success, ) = address(_impl).delegatecall(abi.encodeWithSignature("init(bytes[])", _initData));
        require(success, "Proxy: Initialization failed");

        initializing = false;
    }

    function changeAdmin(address _newAdmin) external ifAdmin {
        admin = _newAdmin;
    }

    function _implementation() internal view override returns (address) {
        address route = callRouting[msg.sender];
        if(route == address(0)) return callRouting[address(0)];
        return route;
    }

    modifier ifAdmin() {
        if (msg.sender == admin) {
            _;
        } else {
            _fallback();
        }
    }
}
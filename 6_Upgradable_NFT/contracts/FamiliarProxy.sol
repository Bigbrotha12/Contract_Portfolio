// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "Contract_Portfolio/node_modules/@openzeppelin/contracts/proxy/Proxy.sol";
import "./CommonStorage.sol";

contract FamiliarProxy is Proxy, CommonStorage {

    modifier onlyOwner() {
        _;
    }

    /* Initial initData_
     * [0] = "1.0.0"              - version
     * [1] = "Familiars"          - name
     * [2] = "FML"                - symbol
     * [3] = "https://dweb.link/ipfs/QmULobYqseNeVckNXSQEWaoX7MHn8HH9RZGhi8kpXVKrKL/Images/"
     */
    function init(address impl_, bytes[] calldata initData_) external onlyOwner {
        require(!_initStatus[impl_], "Proxy: Contract already initialized");

        _initStatus[impl_] = true;
        setImplementation(impl_);
        _version[impl_] = string(initData_[0]);

        (bool success, ) = impl_.delegatecall(abi.encodeWithSignature("init(bytes[])", initData_));
        assert(success);
    }

    function getVersion() external view returns (string memory) {
        return _version[_implementation()];
    }

    function _implementation() internal view override returns (address) {
        return _address["implAddress"];
    }

    function setImplementation(address implementation_) public onlyOwner {
        _address["implAddress"] = implementation_;
    }

    function setRootURI(string calldata newURI) public onlyOwner {
        _rootURI = newURI;
    }
}
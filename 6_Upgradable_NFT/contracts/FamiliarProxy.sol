// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./CommonStorage.sol";

/// @title FamiliarProxy
/// @notice Proxy implementation handling contract call forwarding,
/// @notice access controls, and upgradability logic for Familiar dApp.
/// @dev Logic implementation or base contracts other 
/// @dev than CommonStorage must not declare any state variables
contract FamiliarProxy is Proxy, CommonStorage {

    //--------------------  CONSTRUCTOR ----------------------------------------

    /// @notice Sets up the initial routing configuration for the different roles.
    /// @dev All users other than Admin and IMX should be routed to current NFT
    /// @dev implementation maintained in callRouting[address(0)].
    /// @param _routingConfig   is address of roles and target implementations 
    constructor(address[] memory _routingConfig) {
        admin = _routingConfig[0]; callRouting[_routingConfig[0]] = _routingConfig[1];
        imx = _routingConfig[2]; callRouting[_routingConfig[2]] = _routingConfig[3];
        callRouting[address(0)] = _routingConfig[4];
        version[_routingConfig[4]] = "1.0.0";
    }

    /// Access control for proxy functions in line with transparent proxy pattern
    modifier ifAdmin() {
        if (msg.sender == admin) {
            _;
        } else {
            _fallback();
        }
    }

    //------------------- VIEW FUNCTIONS ----------------------------------------

    /// @notice Returns version of current NFT implementation
    function getVersion() external ifAdmin returns (string memory) {
        return version[callRouting[address(0)]];
    }

    function _implementation() internal view override returns (address) {
        address route = callRouting[msg.sender];
        if(route == address(0)) return callRouting[address(0)];
        return route;
    }

    //-------------------- MUTATIVE FUNCTIONS ----------------------------------

    /// @notice Starts upgrade and initialization process for new NFT implementation
    /// @dev New NFT contract must be valid (implements ERC721, ERC721Metadata, ERC165, and Initializable).
    /// @dev First index of initData provide version information.
    /// @param _impl        new ERC165-compliant NFT implementation
    /// @param _initData    data to be passed to new contract for initialization.
    function upgradeAndInit(IERC165 _impl, bytes[] calldata _initData) external ifAdmin {
        require(!initializing, "Proxy: Initialization in progress");
        require(!initialized[address(_impl)], "Proxy: Contract already initialized");
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

        initialized[address(_impl)] = true;
        initializing = false;
    }

    /// @notice Transfer administrator to new address
    /// @param _newAdmin    address of new administrator
    function changeAdmin(address _newAdmin) external ifAdmin {
        admin = _newAdmin;
    }  

    /// @notice Updates routing configuration for special roles
    /// @dev Default routes should only be updated via upgradeAndInit function.
    /// @dev Hence, _sender cannot be address(0).
    /// @param _sender      address of role to be routed to new target contract
    /// @param _target      target address for given role address
    function changeRouting(address _sender, address _target) external ifAdmin {
        require(_sender != address(0), "Proxy: Improper route change");
        callRouting[_sender] = _target;
    }  
}
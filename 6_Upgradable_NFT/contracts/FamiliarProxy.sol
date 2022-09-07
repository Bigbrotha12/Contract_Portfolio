// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9;

import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./CommonStorage.sol";

/// @title FamiliarProxy
/// @notice Proxy implementation handling contract call forwarding,
/// @notice access controls, and upgradability logic for Familiar dApp.
/// @dev Logic implementation or base contracts other 
/// @dev than CommonStorage must not declare any state variables
contract FamiliarProxy is Proxy, CommonStorage {

    //----------------------- EVENTS -------------------------------------------

    event contractUpgraded(string indexed version, address target);
    event adminChanged(address indexed prevAdmin, address newAdmin);
    event routingUpdated(address indexed role, address target);
    event currentVersion(string indexed version, address target);
    event currentRouting(address role, address target);

    //--------------------  CONSTRUCTOR ----------------------------------------

    /// @notice Sets up the initial routing configuration for the different roles.
    /// @dev Maintains routes for special roles Admin and IMX.
    /// @param _routingConfig   is address of special roles and target implementations 
    constructor(address[] memory _routingConfig) {
        admin = _routingConfig[0]; callRouting[_routingConfig[0]] = _routingConfig[1];
        imx = _routingConfig[2]; callRouting[_routingConfig[2]] = _routingConfig[3];
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

    /// @notice Returns version of current NFT implementation via event
    function getVersion() external ifAdmin {
        address impl = callRouting[address(0)];
        emit currentVersion(version[impl], impl);
    }

    function _implementation() internal view override returns (address) {
        address route = callRouting[msg.sender];
        if(route == address(0)) return callRouting[address(0)];
        return route;
    }

    /// @notice Returns route for given role via event
    function getRouting(address _role) external ifAdmin {
        emit currentRouting(_role, callRouting[_role]);
    }

    //-------------------- MUTATIVE FUNCTIONS ----------------------------------

    /// @notice Starts upgrade and initialization process for new NFT implementation
    /// @dev New NFT contract must be valid (implements ERC721, ERC721Metadata, ERC165, and Initializable).
    /// @dev First index of initData provide version information.
    /// @param _impl        new ERC165-compliant NFT implementation
    /// @param _initData    data to be passed to new contract for initialization.
    function upgradeInit(IERC165 _impl, bytes[] calldata _initData) external ifAdmin {
        require(!initializing, "Proxy: Initialization in progress");
        require(!initialized[address(_impl)], "Proxy: Contract already initialized");
        bool validTarget = 
            _impl.supportsInterface(0x80ac58cd) &&      // IERC721
            _impl.supportsInterface(0x5b5e139f) &&      // IERC721Metadata
            _impl.supportsInterface(0x2a55205a) &&      // IERC2981
            _impl.supportsInterface(0x459fb2ad);        // IInitializable
        require(validTarget, "Proxy: Invalid upgrade target");

        initializing = true;
        callRouting[address(0)] = address(_impl);
        version[address(_impl)] = string(_initData[0]);

        (bool success, ) = address(_impl).delegatecall(abi.encodeWithSignature("init(bytes[])", _initData));
        require(success, "Proxy: Initialization failed");

        initialized[address(_impl)] = true;
        initializing = false;
        emit contractUpgraded(string(_initData[0]), address(_impl));
    }

    /// @notice Transfer administrator to new address
    /// @param _newAdmin    address of new administrator. Cannot be address 0
    function changeAdmin(address _newAdmin) external ifAdmin {
        require(_newAdmin != address(0), "Proxy: Invalid admin address");
        address oldAdmin = admin;
        admin = _newAdmin;
        emit adminChanged(oldAdmin, _newAdmin);
    }  

    /// @notice Renounces administrator rights forever
    function renounceAdmin() external ifAdmin {
        address oldAdmin = admin;
        admin = address(0);
        callRouting[oldAdmin] = address(0);
        emit adminChanged(oldAdmin, address(0));
    }  

    /// @notice Updates routing configuration for special roles
    /// @dev Default routes should only be updated via upgradeAndInit function.
    /// @dev Hence, _sender cannot be address(0).
    /// @param _role        address of role to be routed to new target contract
    /// @param _target      target address for given role address
    function changeRouting(address _role, address _target) external ifAdmin {
        require(_role != address(0), "Proxy: Improper route change");
        callRouting[_role] = _target;
        emit routingUpdated(_role, _target);
    }  
}
// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {Proxy} from "@openzeppelin/contracts/proxy/Proxy.sol";
import {ERC165, IERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {CommonStorage} from "./CommonStorage.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// @title FamiliarProxy
/// @notice Proxy handling contract call forwarding, access controls, and upgradability logic for Familiar dApp.
/// @dev Logic implementation or base contracts other than CommonStorage must not declare any state variables
contract FamiliarProxy is Proxy, CommonStorage {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 EVENTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    event ContractUpgraded(string indexed version, address target);
    event AdminChanged(address indexed prevAdmin, address newAdmin);
    event RoutingUpdated(address indexed role, address target);
    event CurrentVersion(string indexed version, address target);
    event CurrentRouting(address role, address target);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 ERRORS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    error FamiliarProxy__Initializing();
    error FamiliarProxy__Initialized();
    error FamiliarProxy__MissingInterface();
    error FamiliarProxy__FailedInitialization(bytes errorData);
    error FamiliarProxy__ZeroAddress();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                MODIFIERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// Access control for proxy functions in line with transparent proxy pattern
    modifier ifAdmin() {
        if (msg.sender == s_admin_) {
            _;
        } else {
            _fallback();
        }
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    receive() external payable {
        revert();
    }

    /// @notice Sets up the initial routing configuration for the different roles.
    /// @dev Maintains routes for special roles Admin and IMX.
    /// @param _routingConfig address of special roles and target implementations
    constructor(address[] memory _routingConfig) {
        s_admin_ = _routingConfig[0];
        s_callRouting_[_routingConfig[0]] = _routingConfig[1];
        s_imx_ = _routingConfig[2];
        s_callRouting_[_routingConfig[2]] = _routingConfig[3];
    }

    /// @notice Returns version of current NFT implementation via event
    function getVersion() external ifAdmin {
        address impl = s_callRouting_[address(0)];
        
        emit CurrentVersion(s_version_[impl], impl);
    }

    /// @notice Returns route for given role via event
    function getRouting(address _role) external ifAdmin {
        emit CurrentRouting(_role, s_callRouting_[_role]);
    }

    /// @notice Starts upgrade and initialization process for new NFT implementation
    /// @dev New NFT contract must be valid (implements ERC721, ERC721Metadata, ERC165, and Initializable).
    /// @dev First index of initData provide version information.
    /// @param _impl new ERC165-compliant NFT implementation
    /// @param _initData data to be passed to new contract for initialization.
    function upgradeInit(IERC165 _impl, bytes[] calldata _initData) external ifAdmin {
        if(s_initializing_) revert FamiliarProxy__Initializing();
        if(s_initialized_[address(_impl)]) revert FamiliarProxy__Initialized();
   
        bool validTarget = _impl.supportsInterface(0x80ac58cd) &&   // IERC721
            _impl.supportsInterface(0x5b5e139f) &&                  // IERC721Metadata
            _impl.supportsInterface(0x2a55205a) &&                  // IERC2981
            _impl.supportsInterface(0x459fb2ad);                    // IInitializable
        if(!validTarget) revert FamiliarProxy__MissingInterface();

        s_initializing_ = true;
        s_callRouting_[address(0)] = address(_impl);
        s_version_[address(_impl)] = string(_initData[0]);

        (bool success, bytes memory err) = address(_impl).delegatecall(
            abi.encodeWithSignature("init(bytes[])", _initData)
        );
        if(!success) revert FamiliarProxy__FailedInitialization(err);

        s_initialized_[address(_impl)] = true;
        s_initializing_ = false;

        emit ContractUpgraded(string(_initData[0]), address(_impl));
    }

    /// @notice Transfer administrator to new address
    /// @param _newAdmin address of new administrator. Cannot be address 0
    function changeAdmin(address _newAdmin) external ifAdmin {
        if(_newAdmin == address(0)) revert FamiliarProxy__ZeroAddress();
        
        address oldAdmin = s_admin_;
        s_admin_ = _newAdmin;
        
        emit AdminChanged(oldAdmin, _newAdmin);
    }

    /// @notice Renounces administrator rights forever
    function renounceAdmin() external ifAdmin {
        address oldAdmin = s_admin_;
        s_admin_ = address(0);
        s_callRouting_[oldAdmin] = address(0);
        
        emit AdminChanged(oldAdmin, address(0));
    }

    /// @notice Updates routing configuration for special roles
    /// @dev Default routes should only be updated via upgradeAndInit function. Hence, _sender cannot be address(0).
    /// @param _role address of role to be routed to new target contract
    /// @param _target target address for given role address
    function changeRouting(address _role, address _target) external ifAdmin {
        if(_role == address(0)) revert FamiliarProxy__ZeroAddress();
        
        s_callRouting_[_role] = _target;
        
        emit RoutingUpdated(_role, _target);
    }

    function _implementation() internal view override returns (address route) {
        route = s_callRouting_[msg.sender];
        if (route == address(0)) return s_callRouting_[address(0)];
    }
}

// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                IMPORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import {IMX} from "./IMX.sol";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                               CONTRACTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

contract Registration {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            STORAGE VARIABLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    IMX public immutable i_imx;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 ERRORS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    error Registration__FailedDeposit();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    constructor(IMX _imx) {
        i_imx = _imx;
    }

    function registerAndDeposit(
        address ethKey,
        uint256 starkKey,
        bytes calldata signature,
        uint256 assetType,
        uint256 vaultId
    ) 
    external 
    payable 
    {
        i_imx.registerUser(ethKey, starkKey, signature);
        // the standard way to write this is: imx.deposit.value(msg.value)(starkKey, assetType, vaultId);
        // but the Solidity compiler hates the overloading of deposit + the use of .value()
        (bool success, ) = address(i_imx).call{value: msg.value}(
            abi.encodeWithSignature(
                "deposit(uint256,uint256,uint256)",
                starkKey,
                assetType,
                vaultId
            )
        );
        if(!success) revert Registration__FailedDeposit();
    }

    function registerAndDeposit(
        address ethKey,
        uint256 starkKey,
        bytes calldata signature,
        uint256 assetType,
        uint256 vaultId,
        uint256 quantizedAmount
    ) 
    external 
    {
        i_imx.registerUser(ethKey, starkKey, signature);
        i_imx.deposit(starkKey, assetType, vaultId, quantizedAmount);
    }

    function registerAndDepositNft(
        address ethKey,
        uint256 starkKey,
        bytes calldata signature,
        uint256 assetType,
        uint256 vaultId,
        uint256 tokenId
    ) 
    external 
    {
        i_imx.registerUser(ethKey, starkKey, signature);
        i_imx.depositNft(starkKey, assetType, vaultId, tokenId);
    }

    function registerAndWithdraw(
        address ethKey,
        uint256 starkKey,
        bytes calldata signature,
        uint256 assetType
    ) 
    external 
    {
        i_imx.registerUser(ethKey, starkKey, signature);
        i_imx.withdraw(starkKey, assetType);
    }

    function registerAndWithdrawTo(
        address ethKey,
        uint256 starkKey,
        bytes calldata signature,
        uint256 assetType,
        address recipient
    ) 
    external 
    {
        i_imx.registerUser(ethKey, starkKey, signature);
        i_imx.withdrawTo(starkKey, assetType, recipient);
    }

    function registerAndWithdrawNft(
        address ethKey,
        uint256 starkKey,
        bytes calldata signature,
        uint256 assetType,
        uint256 tokenId
    ) 
    external 
    {
        i_imx.registerUser(ethKey, starkKey, signature);
        i_imx.withdrawNft(starkKey, assetType, tokenId);
    }

    function registerAndWithdrawNftTo(
        address ethKey,
        uint256 starkKey,
        bytes calldata signature,
        uint256 assetType,
        uint256 tokenId,
        address recipient
    ) 
    external 
    {
        i_imx.registerUser(ethKey, starkKey, signature);
        i_imx.withdrawNftTo(starkKey, assetType, tokenId, recipient);
    }

    function regsiterAndWithdrawAndMint(
        address ethKey,
        uint256 starkKey,
        bytes calldata signature,
        uint256 assetType,
        bytes calldata mintingBlob
    ) 
    external 
    {
        i_imx.registerUser(ethKey, starkKey, signature);
        i_imx.withdrawAndMint(starkKey, assetType, mintingBlob);
    }

    function isRegistered(uint256 starkKey) public view returns (bool) {
        return i_imx.getEthKey(starkKey) != address(0);
    }
}
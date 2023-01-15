// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./IMintable.sol";
import "./Minting.sol";
import "../CommonStorage.sol";

abstract contract Mintable is CommonStorage, IMintable {

    event AssetMinted(address to, uint256 id, bytes blueprint);

    function mintFor(
        address user,
        uint256 quantity,
        bytes calldata mintingBlob
    ) external override {
        require(quantity == 1, "Mintable: Invalid mint quantity");
        (uint256 id, bytes memory blueprint) = Minting.split(mintingBlob);
        _mintFor(user, id, blueprint);
        emit AssetMinted(user, id, blueprint);
    }

    function _mintFor(
        address to,
        uint256 id,
        bytes memory blueprint
    ) internal virtual;
}
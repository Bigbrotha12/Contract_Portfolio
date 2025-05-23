// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

interface IMintable {
    function mintFor(address to, uint256 quantity, bytes calldata mintingBlob) external;
}
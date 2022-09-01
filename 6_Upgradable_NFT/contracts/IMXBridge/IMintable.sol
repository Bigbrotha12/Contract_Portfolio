// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface IMintable {
    function mintFor(
        address to,
        uint256 quantity,
        bytes calldata mintingBlob
    ) external;
}
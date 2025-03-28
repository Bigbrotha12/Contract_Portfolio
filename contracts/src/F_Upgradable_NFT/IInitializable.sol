// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

interface IInitializable {
    function init(bytes[] calldata) external;
}
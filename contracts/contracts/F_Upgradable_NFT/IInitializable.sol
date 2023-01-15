// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.9;

interface IInitializable {
    function init(bytes[] calldata) external;
}
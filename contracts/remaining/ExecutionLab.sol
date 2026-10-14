// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// Local demonstration contracts only; not audited production token integrations.
contract BatchExecutorLab {
    event Result(uint256 indexed index, bool success, bytes returnData);
    function execute(address[] calldata targets, bytes[] calldata calls) external {
        require(targets.length >= 3 && targets.length == calls.length, "three calls required");
        for (uint256 i; i < targets.length; ++i) {
            (bool success, bytes memory result) = targets[i].call(calls[i]);
            emit Result(i, success, result);
        }
    }
}
contract ActionLab {
    mapping(uint256 => uint256) public values;
    function action(uint256 id, uint256 value, bool fail) external {
        require(!fail, "forced independent failure"); values[id] = value;
    }
}
contract PriceSourceLab {
    uint256 public price = 10000; // quote cents per base unit; controlled local reference rate
    function setPrice(uint256 next) external { require(next > 0, "positive price"); price = next; }
}
contract SagaLab {
    address public immutable owner;
    uint256 public cash = 1000;
    uint256 public allowance;
    uint256 public assets;
    uint256 public deposited;
    constructor() { owner = msg.sender; }
    modifier onlyOwner() { require(msg.sender == owner, "owner"); _; }
    function approve(uint256 amount) external onlyOwner { allowance = amount; }
    function swap(uint256 amount) external onlyOwner {
        require(allowance >= amount && cash >= amount, "approval and cash required");
        allowance -= amount; cash -= amount; assets += amount;
    }
    function deposit(uint256 amount, bool forceFailure) external onlyOwner {
        require(!forceFailure, "forced deposit failure"); require(assets >= amount, "swap required");
        assets -= amount; deposited += amount;
    }
    function undoSwap(uint256 amount) external onlyOwner {
        require(assets >= amount, "assets required"); assets -= amount; cash += amount;
    }
}

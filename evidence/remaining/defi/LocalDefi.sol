// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract LocalDefi {
 function decimals() external pure returns(uint8){return 6;}
 function price() external pure returns(uint256){return 1e36;}
 function idToMarketParams(bytes32) external view returns(address,address,address,address,uint256){return(address(this),address(this),address(this),address(0),8e17);}
 function position(bytes32,address) external pure returns(uint256,uint128,uint128){return(0,100000000000000,150000000);}
 function market(bytes32) external view returns(uint128,uint128,uint128,uint128,uint128,uint128){return(100000000,100000000000000,100000000,100000000000000,uint128(block.timestamp),0);}
 event Requested(address indexed owner,uint256 amount,bool redeem);
 function requestDeposit(uint256 amount,address controller,address owner) external returns(uint256){require(amount>0 && controller==owner && msg.sender==owner);emit Requested(owner,amount,false);return 0;}
 function requestRedeem(uint256 shares,address controller,address owner) external returns(uint256){require(shares>0 && controller==owner && msg.sender==owner);emit Requested(owner,shares,true);return 0;}
}

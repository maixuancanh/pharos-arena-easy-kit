// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// Disposable integration lab. Not audited and not intended for public funds.
contract LabToken {
 string public symbol="LABUSD";uint8 public constant decimals=6;
 mapping(address=>uint256) public balanceOf;mapping(address=>mapping(address=>uint256)) public allowance;
 event Transfer(address indexed from,address indexed to,uint256 amount);
 function mint(address to,uint256 n) external {balanceOf[to]+=n;emit Transfer(address(0),to,n);}
 function approve(address to,uint256 n) external returns(bool){allowance[msg.sender][to]=n;return true;}
 function transfer(address to,uint256 n) external returns(bool){_transfer(msg.sender,to,n);return true;}
 function transferFrom(address from,address to,uint256 n) external returns(bool){require(allowance[from][msg.sender]>=n,"allowance");allowance[from][msg.sender]-=n;_transfer(from,to,n);return true;}
 function _transfer(address from,address to,uint256 n) internal {require(balanceOf[from]>=n,"balance");balanceOf[from]-=n;balanceOf[to]+=n;emit Transfer(from,to,n);}
}
contract LabVault {
 LabToken public asset;string public symbol;uint8 public constant decimals=6;uint256 public price=1e18;
 mapping(address=>uint256) public balanceOf;bool public available=true;address public admin;
 event Deposit(address indexed caller,address indexed owner,uint256 assets,uint256 shares);
 event Withdraw(address indexed caller,address indexed receiver,address indexed owner,uint256 assets,uint256 shares);
 constructor(LabToken token,string memory name){asset=token;symbol=name;admin=msg.sender;}
 function share() external view returns(address){return address(this);}
 function setPrice(uint256 p) external {require(msg.sender==admin&&p>0);price=p;}
 function setAvailable(bool v) external {require(msg.sender==admin);available=v;}
 function convertToAssets(uint256 shares) public view returns(uint256){require(available,"venue offline");return shares*price/1e18;}
 function maxDeposit(address) external view returns(uint256){return available?type(uint128).max:0;}
 function maxWithdraw(address owner) external view returns(uint256){return available?convertToAssets(balanceOf[owner]):0;}
 function deposit(uint256 n,address owner) external returns(uint256 shares){require(available&&n>0);shares=n*1e18/price;require(shares>0);require(asset.transferFrom(msg.sender,address(this),n));balanceOf[owner]+=shares;emit Deposit(msg.sender,owner,n,shares);}
 function withdraw(uint256 n,address receiver,address owner) external returns(uint256 shares){require(available&&msg.sender==owner&&n>0);shares=(n*1e18+price-1)/price;require(balanceOf[owner]>=shares,"shares");balanceOf[owner]-=shares;require(asset.transfer(receiver,n));emit Withdraw(msg.sender,receiver,owner,n,shares);}
}
contract LabOracle {
 uint256 public price=1e36;address public admin=msg.sender;
 function setPrice(uint256 p) external {require(msg.sender==admin&&p>0);price=p;}
}
contract LabLending {
 struct Position {uint256 supplyShares;uint128 borrowShares;uint128 collateral;}
 LabToken public token;LabOracle public oracle;mapping(bytes32=>mapping(address=>Position)) public position;
 uint128 public debt;uint128 public debtShares;uint128 public lastUpdate;
 constructor(LabToken t,LabOracle o){token=t;oracle=o;lastUpdate=uint128(block.timestamp);}
 function idToMarketParams(bytes32) external view returns(address,address,address,address,uint256){return(address(token),address(token),address(oracle),address(0),8e17);}
 function market(bytes32) external view returns(uint128,uint128,uint128,uint128,uint128,uint128){return(uint128(token.balanceOf(address(this))),0,debt,debtShares,lastUpdate,0);}
 function supplyCollateral(bytes32 id,uint128 amount) external {require(token.transferFrom(msg.sender,address(this),amount));position[id][msg.sender].collateral+=amount;}
 function borrow(bytes32 id,uint128 amount) external {Position storage p=position[id][msg.sender];require((uint256(p.borrowShares)/1e6+amount)*1e36<=uint256(p.collateral)*oracle.price()*8/10,"unsafe loan");p.borrowShares+=amount*1e6;debt+=amount;debtShares+=amount*1e6;lastUpdate=uint128(block.timestamp);require(token.transfer(msg.sender,amount));}
 function repay(bytes32 id,uint128 amount) external {Position storage p=position[id][msg.sender];require(amount>0&&uint256(amount)*1e6<=p.borrowShares);require(token.transferFrom(msg.sender,address(this),amount));p.borrowShares-=amount*1e6;debt-=amount;debtShares-=amount*1e6;lastUpdate=uint128(block.timestamp);}
}

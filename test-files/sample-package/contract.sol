// Sample contract code
pragma solidity ^0.8.0;

contract SampleContract {
    string public name = "Sample";
    
    function greet() public pure returns (string memory) {
        return "Hello from AxoHub!";
    }
    
    function increment(uint256 x) public pure returns (uint256) {
        return x + 1;
    }
}

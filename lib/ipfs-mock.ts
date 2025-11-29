/**
 * Mock IPFS client for demo purposes
 */

export const ipfsMock = {
    /**
     * Mock fetching text content from IPFS
     */
    getText: async (cid: string): Promise<string> => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Return mock contract code based on CID
        return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MockContract
 * @dev This is a mock contract retrieved from IPFS for demo purposes.
 * CID: ${cid}
 */

contract MockContract {
    string public name;
    address public owner;

    event NameUpdated(string oldName, string newName);

    constructor(string memory _name) {
        name = _name;
        owner = msg.sender;
    }

    function updateName(string memory _name) public {
        require(msg.sender == owner, "Only owner can update name");
        emit NameUpdated(name, _name);
        name = _name;
    }

    function getOwner() public view returns (address) {
        return owner;
    }
}
`
    }
}

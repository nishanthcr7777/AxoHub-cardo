// pragma circom 2.0.0;

// Simple hash function for demonstration
template Poseidon1() {
    signal input in;
    signal output out;
    
    // Simple hash: out = in * in + in
    out <== in * in + in;
}

// Prove NFT ownership without revealing the NFT ID
template OwnershipProof() {
    // Private inputs (secret - not revealed)
    signal input nftId;
    signal input encryptedCid;
    
    // Public outputs (visible on-chain)
    signal output nftIdHash;
    signal output cidCommitment;
    
    // Hash the NFT ID
    component hasher1 = Poseidon1();
    hasher1.in <== nftId;
    nftIdHash <== hasher1.out;
    
    // Create commitment for encrypted CID
    component hasher2 = Poseidon1();
    hasher2.in <== encryptedCid;
    cidCommitment <== hasher2.out;
}

component main = OwnershipProof();

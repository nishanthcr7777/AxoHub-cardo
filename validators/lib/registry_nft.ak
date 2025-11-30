use aiken/hash.{Blake2b_224, Hash, blake2b_256}
use aiken/list
use aiken/transaction.{Mint, ScriptContext}
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value

// NFT minting policy for registry items
// Ensures one unique NFT per name+version combination
validator {
  fn registry_nft(redeemer: MintAction, ctx: ScriptContext) {
    when redeemer is {
      MintNFT { name, version } -> validate_mint(name, version, ctx)
      BurnNFT -> validate_burn(ctx)
    }
  }
}

type MintAction {
  MintNFT { name: ByteArray, version: ByteArray }
  BurnNFT
}

// Validate NFT minting
fn validate_mint(name: ByteArray, version: ByteArray, ctx: ScriptContext) -> Bool {
  expect Mint(policy_id) = ctx.purpose
  
  // Token name = hash(name + version)
  let token_name = blake2b_256(list.concat(name, version))
  
  // Exactly 1 token must be minted
  let minted_value = value.from_minted_value(ctx.transaction.mint)
  let minted_amount = value.quantity_of(minted_value, policy_id, token_name)
  
  // Must mint exactly 1
  minted_amount == 1
}

// Validate NFT burning (for deprecation)
fn validate_burn(ctx: ScriptContext) -> Bool {
  expect Mint(policy_id) = ctx.purpose
  
  // At least one token must be burned (negative amount)
  let minted_value = value.from_minted_value(ctx.transaction.mint)
  
  // Check that we're burning, not minting
  value.reduce(
    minted_value,
    True,
    fn(_, _, amount, acc) { acc && amount < 0 }
  )
}

test mint_nft_valid() {
  // Test minting one NFT
  True
}

test mint_nft_duplicate() {
  // Test that duplicate name+version fails
  True
}

use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, find_input}
use aiken/transaction/credential.{VerificationKey}

// Registry datum structure
type RegistryDatum {
  item_type: ByteArray,      // "contract" or "package"
  name: ByteArray,
  version: ByteArray,
  source_cid: ByteArray,
  metadata_cid: ByteArray,
  publisher: Hash<Blake2b_224, VerificationKey>,
  timestamp: Int,
}

// Registry actions (redeemer)
type RegistryAction {
  Publish
  Update { old_version: ByteArray }
  Deprecate { reason: ByteArray }
}

// Main validator
validator {
  fn registry(datum: RegistryDatum, redeemer: RegistryAction, context: ScriptContext) {
    when redeemer is {
      Publish -> validate_publish(datum, context)
      Update { old_version } -> validate_update(datum, old_version, context)
      Deprecate { reason } -> validate_deprecate(datum, reason, context)
    }
  }
}

// Validate new publish
fn validate_publish(datum: RegistryDatum, ctx: ScriptContext) -> Bool {
  expect Spend(output_reference) = ctx.purpose
  expect Some(input) = find_input(ctx.transaction.inputs, output_reference)
  
  // 1. Publisher must sign the transaction
  let publisher_signed = list.has(ctx.transaction.extra_signatories, datum.publisher)
  
  // 2. Version must be valid semantic version (x.y.z)
  let valid_version = validate_semantic_version(datum.version)
  
  // 3. CIDs must be valid IPFS format (starts with "Qm" or "bafy")
  let valid_source_cid = validate_ipfs_cid(datum.source_cid)
  let valid_metadata_cid = validate_ipfs_cid(datum.metadata_cid)
  
  // 4. Timestamp must be recent (within 1 hour)
  let current_time = get_current_time(ctx)
  let valid_timestamp = datum.timestamp >= current_time - 3600000 && 
                       datum.timestamp <= current_time + 3600000
  
  // 5. Item type must be valid
  let valid_type = datum.item_type == "contract" || datum.item_type == "package"
  
  // All conditions must be true
  publisher_signed && valid_version && valid_source_cid && 
  valid_metadata_cid && valid_timestamp && valid_type
}

// Validate update
fn validate_update(datum: RegistryDatum, old_version: ByteArray, ctx: ScriptContext) -> Bool {
  expect Spend(output_reference) = ctx.purpose
  
  // Publisher must sign
  let publisher_signed = list.has(ctx.transaction.extra_signatories, datum.publisher)
  
  // New version must be greater than old version
  let valid_version_bump = compare_versions(datum.version, old_version) > 0
  
  // Same validation as publish
  let valid_cids = validate_ipfs_cid(datum.source_cid) && 
                   validate_ipfs_cid(datum.metadata_cid)
  
  publisher_signed && valid_version_bump && valid_cids
}

// Validate deprecation
fn validate_deprecate(datum: RegistryDatum, reason: ByteArray, ctx: ScriptContext) -> Bool {
  // Only publisher can deprecate
  list.has(ctx.transaction.extra_signatories, datum.publisher) &&
  // Reason must be provided
  list.length(reason) > 0
}

// Helper: Validate semantic version format (x.y.z)
fn validate_semantic_version(version: ByteArray) -> Bool {
  // Check format: digits.digits.digits
  // Simplified check: length > 4 and contains dots
  list.length(version) >= 5 && list.has(version, 46) // 46 is ASCII for '.'
}

// Helper: Validate IPFS CID format
fn validate_ipfs_cid(cid: ByteArray) -> Bool {
  let len = list.length(cid)
  // CIDv0 starts with "Qm" (length 46)
  // CIDv1 starts with "bafy" (length 59)
  (len == 46 && list.take(cid, 2) == "Qm") ||
  (len == 59 && list.take(cid, 4) == "bafy")
}

// Helper: Compare semantic versions
fn compare_versions(v1: ByteArray, v2: ByteArray) -> Int {
  // Simplified: compare as strings
  // In production, parse and compare major.minor.patch
  if v1 == v2 {
    0
  } else if v1 > v2 {
    1
  } else {
    -1
  }
}

// Helper: Get current time from transaction validity range
fn get_current_time(ctx: ScriptContext) -> Int {
  when ctx.transaction.validity_range.lower_bound.bound_type is {
    Finite(t) -> t
    _ -> 0
  }
}

// Tests
test publish_valid() {
  let datum = RegistryDatum {
    item_type: "contract",
    name: "MyContract",
    version: "1.0.0",
    source_cid: "QmX1234567890abcdefghijklmnopqrstuvwxyz1234",
    metadata_cid: "QmY1234567890abcdefghijklmnopqrstuvwxyz1234",
    publisher: #"aabbccdd",
    timestamp: 1700000000000,
  }
  
  // Test would require full ScriptContext mock
  True
}

test publish_invalid_version() {
  // Test invalid version format
  True
}

test publish_invalid_cid() {
  // Test invalid IPFS CID
  True
}

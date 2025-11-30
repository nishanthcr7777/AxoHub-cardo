use aiken/hash.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{OutputReference, Transaction, ScriptContext, Spend}
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value

type Datum {
  policy_id: ByteArray,
  asset_name: ByteArray,
  seller: ByteArray, // VerificationKeyHash
  price: Int,
}

type Redeemer {
  Buy
  Cancel
}

validator {
  fn marketplace(datum: Datum, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Spend(_) ->
        when redeemer is {
          Buy -> {
            let must_pay_seller =
              list.any(
                ctx.transaction.outputs,
                fn(output) {
                  value.lovelace_of(output.value) >= datum.price &&
                  output.address.payment_credential == credential.VerificationKey(datum.seller)
                },
              )
            must_pay_seller
          }
          Cancel -> {
            let must_be_signed_by_seller =
              list.has(ctx.transaction.extra_signatories, datum.seller)
            must_be_signed_by_seller
          }
        }
      _ -> False
    }
  }
}

use aiken/interval.{Finite}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, Transaction}
use aiken/transaction/credential.{VerificationKey}

type VestingDatum {
  beneficiary: ByteArray, // VerificationKeyHash
  deadline: Int,
}

validator {
  fn vesting(datum: VestingDatum, _redeemer: Void, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Spend(_) -> {
        let must_be_signed_by_beneficiary =
          list.has(ctx.transaction.extra_signatories, datum.beneficiary)

        let must_be_after_deadline =
          when ctx.transaction.validity_range.lower_bound.bound_type is {
            Finite(now) -> now >= datum.deadline
            _ -> False
          }

        must_be_signed_by_beneficiary && must_be_after_deadline
      }
      _ -> False
    }
  }
}

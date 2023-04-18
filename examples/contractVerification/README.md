### **Verify Contract**

To verify a contract, you can use **`verify`** method of the **`contracts`** namespace.

There are three examples that show the usage of `tenderly.contracts.verify` method:
- First example shows the verification of a simple `Counter` contract with no dependencies.
- Second example shows the verification of a `MyToken` contract that has multiple dependencies which are other contracts.
- Third example shows the verification of a `LibraryToken` contract that has a library dependency.

You can start these examples with:
- `pnpm start:example:contractVerification:simpleCounter`
- `pnpm start:example:contractVerification:withDependencies`
- `pnpm start:example:contractVerification:withLibrary`

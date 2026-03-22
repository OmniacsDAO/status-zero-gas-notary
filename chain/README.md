# Chain Package

This subproject contains the contract and deployment scripts for Status Zero Gas Notary.

## Commands

```bash
npm install
npx hardhat compile
npx hardhat ignition deploy ignition/modules/StatusZeroGasNotary.ts --network statusSepolia
STATUS_DRAFT_PATH=../examples/sample-draft.json \
STATUS_NOTARY_ADDRESS=0xYourContractAddress \
npx hardhat run scripts/notarize.ts --network statusSepolia
```

The Hardhat configuration loads environment variables from `../.env`.

Official Status references used while building:

- https://docs.status.network/general-info/network-details
- https://docs.status.network/tutorials/deploying-contracts/using-hardhat
- https://docs.status.network/tools/block-explorers/


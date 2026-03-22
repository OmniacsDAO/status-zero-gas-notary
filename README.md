# Status Zero Gas Notary

**A gasless public notary for AI-generated action records on Status Network Sepolia.**

Status Zero Gas Notary turns messy operational updates into public, hash-linked records without making users pay transaction fees. A human or agent writes what happened, the notary clerk decides what kind of record it is, compresses it into a safe public summary, hashes the full source material, and prepares a Status Sepolia transaction that writes the note onchain.

This is intentionally not a throwaway “hello world” contract. The product is a lightweight accountability layer for milestones, deliveries, incidents, commitments, and field updates where the public proof matters but fee friction usually kills the habit.

## Track Alignment

### Primary: Go Gasless: Deploy & Transact on Status Network with Your AI Agent

Track UUID: `877cd61516a14ad9a199bf48defec1c1`

| Track requirement | How Status Zero Gas Notary fits |
|---|---|
| Deploy a smart contract on Status Sepolia | The repo ships a dedicated contract and Hardhat deployment path in [`chain/`](./chain) |
| Execute at least one gasless transaction | The qualifying transaction is a `notarize` write on the deployed contract, with proof templates ready in [`proofs/`](./proofs) |
| Include an AI agent component | The shipped notary clerk classifies updates, determines disclosure shape, creates summaries, hashes source material, and builds contract payloads |
| README or short video demo | This repo is submission-grade and includes evaluator-facing examples, proof templates, and a static preview |

### Secondary: Synthesis Open Track

Track UUID: `fdb76d08812b43f6a5f454744b66f590`

Why it fits:

- It uses zero-fee transactions as a product primitive instead of a deployment gimmick.
- It adds a chain-utility and accountability lane to the portfolio rather than repeating privacy, receipts, delegation, or ops.

## Problem

Teams constantly need to make lightweight public commitments:

- a field operator says a delivery happened
- a maintainer records that an incident has been contained
- a coordinator marks a milestone complete
- a small agent workflow logs that a promised action actually happened

Most of these updates never make it onchain because normal transaction friction is too high for small, frequent notes. So teams keep the real history in chat threads, screenshots, or docs, where the record is hard to verify and easy to lose.

## Solution

Status Zero Gas Notary is an AI clerk plus a gasless ledger:

1. a human or agent submits a raw operational note
2. the notary clerk classifies the note
3. the clerk decides what should be public and what should stay behind a hash
4. the system creates a compact public summary and two hashes
5. a Status Sepolia transaction writes the note to an onchain notary contract

That gives teams a cheap, low-friction public paper trail.

## What Is Shipped

- A deterministic notary clerk in [`src/agent/notary-agent.mjs`](./src/agent/notary-agent.mjs)
- Optional model-assisted draft generation in [`src/agent/model-client.mjs`](./src/agent/model-client.mjs)
- Input and output schemas in [`src/agent/schema.mjs`](./src/agent/schema.mjs)
- A local demo runner in [`src/cli/demo.mjs`](./src/cli/demo.mjs)
- A Status Sepolia contract in [`chain/contracts/StatusZeroGasNotary.sol`](./chain/contracts/StatusZeroGasNotary.sol)
- Hardhat deployment config in [`chain/hardhat.config.ts`](./chain/hardhat.config.ts)
- A deployment module in [`chain/ignition/modules/StatusZeroGasNotary.ts`](./chain/ignition/modules/StatusZeroGasNotary.ts)
- A notarization script in [`chain/scripts/notarize.ts`](./chain/scripts/notarize.ts)
- Proof templates in [`proofs/`](./proofs)
- Sample drafts and records in [`examples/`](./examples)
- A static visual preview in [`web/index.html`](./web/index.html)

## Product Shape

The notary supports six record kinds:

- `milestone`
- `delivery`
- `observation`
- `incident`
- `commitment`
- `request`

The contract only stores the minimum public footprint:

- record kind
- content hash
- context hash
- short public summary
- optional URI
- author address
- timestamp

That is deliberate. Sensitive raw source material can stay offchain while the public commitment stays verifiable.

## Why Status Is Load-Bearing

Without Status Network, this is just another note processor.

With Status Network:

- the public record becomes cheap enough to use repeatedly
- the product can treat “write the note” as a normal step instead of a high-friction exceptional step
- the chain’s gasless framing becomes the UX story: tiny public proofs should not require fee budgeting

This is why Status is the correct primary home for the repo.

## Agent Flow

```text
Raw note intake
     |
     v
Notary clerk
- classify kind
- derive tags
- decide disclosure boundary
- summarize for public record
- hash the full source payload
     |
     v
Draft payload
- summary
- contentHash
- contextHash
- contract args
     |
     v
Status Sepolia contract
- notarize(...)
     |
     v
Explorer proof + audit trail
```

## Demo

Run the deterministic demo:

```bash
npm install
npm run demo
```

Or point it at a different intake file:

```bash
node src/cli/demo.mjs ./examples/sample-intake.json
```

This writes:

- `output/<slug>/draft.json`
- `output/<slug>/briefing.md`

The sample files already included in the repo are:

- [`examples/sample-intake.json`](./examples/sample-intake.json)
- [`examples/sample-draft.json`](./examples/sample-draft.json)
- [`examples/sample-record.json`](./examples/sample-record.json)

## Chain Deployment

Official network references used while building:

- Status network details: https://docs.status.network/general-info/network-details
- Hardhat tutorial: https://docs.status.network/tutorials/deploying-contracts/using-hardhat
- Explorer docs: https://docs.status.network/tools/block-explorers/

Deployment path:

```bash
cp .env.example .env
cd chain
npm install
npx hardhat compile
npx hardhat ignition deploy ignition/modules/StatusZeroGasNotary.ts --network statusSepolia
```

Once deployed, write a qualifying note:

```bash
STATUS_DRAFT_PATH=../examples/sample-draft.json \
STATUS_NOTARY_ADDRESS=0xYourContractAddress \
npx hardhat run scripts/notarize.ts --network statusSepolia
```

## Proof Collection

The Status bounty is qualification-based, so this repo includes explicit proof placeholders:

- [`proofs/deployment-proof.template.json`](./proofs/deployment-proof.template.json)
- [`proofs/gasless-tx-proof.template.json`](./proofs/gasless-tx-proof.template.json)

Before submission, replace the placeholders with:

- deployed contract address
- deployment tx hash
- notarization tx hash
- explorer links
- the exact observed fee / gas fields visible on the explorer for the qualifying tx

The repo is honest about this: the proof files are templates until you run the deployment and notarization on Status Sepolia.

## Security

The submission is intentionally clean:

- no private keys are committed
- `.env` is ignored
- `.env.example` contains placeholders only
- source material is hashed before public submission
- optional model usage is env-gated, not hardcoded
- the local demo works with no keys at all

If you run the chain scripts live, keep the wallet private key only in environment variables.

## Repo Structure

```text
status-zero-gas-notary/
├── .env.example
├── .gitignore
├── Dockerfile
├── README.md
├── agent.json
├── chain/
│   ├── README.md
│   ├── contracts/
│   │   └── StatusZeroGasNotary.sol
│   ├── hardhat.config.ts
│   ├── ignition/
│   │   └── modules/
│   │       └── StatusZeroGasNotary.ts
│   ├── package.json
│   ├── scripts/
│   │   └── notarize.ts
│   └── tsconfig.json
├── conversationLog.md
├── examples/
│   ├── sample-draft.json
│   ├── sample-intake.json
│   └── sample-record.json
├── package.json
├── proofs/
│   ├── deployment-proof.template.json
│   └── gasless-tx-proof.template.json
├── submission.template.json
├── src/
│   ├── agent/
│   │   ├── heuristics.mjs
│   │   ├── model-client.mjs
│   │   ├── notary-agent.mjs
│   │   ├── render.mjs
│   │   └── schema.mjs
│   └── cli/
│       └── demo.mjs
└── web/
    ├── app.js
    ├── index.html
    ├── sample-data.js
    └── styles.css
```

## Honest Scope

What is implemented:

- a real notary contract
- a real chain deployment path
- a real notarization script
- a real AI clerk layer for turning messy notes into onchain-safe records
- explicit proof packaging for the Status qualifier

What is not claimed:

- no live deployment proof is bundled in this repo yet
- no hosted backend service is included
- no production auth layer is included

That is intentional. The repo stays honest while still making it straightforward to complete the qualifying onchain proof.


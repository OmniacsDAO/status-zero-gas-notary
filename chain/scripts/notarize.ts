import * as dotenv from "dotenv";
import fs from "node:fs/promises";
import hre from "hardhat";

dotenv.config({ path: "../.env" });

async function main() {
  const draftPath = process.env.STATUS_DRAFT_PATH || "../examples/sample-draft.json";
  const contractAddress = process.env.STATUS_NOTARY_ADDRESS;

  if (!contractAddress) {
    throw new Error("Set STATUS_NOTARY_ADDRESS before running the notarization script.");
  }

  const raw = await fs.readFile(draftPath, "utf8");
  const draft = JSON.parse(raw);

  const factory = await hre.ethers.getContractFactory("StatusZeroGasNotary");
  const contract = factory.attach(contractAddress);

  const tx = await contract.notarize(
    draft.decision.kindIndex,
    draft.hashes.contentHash,
    draft.hashes.contextHash,
    draft.summary,
    draft.contractCall.args[4],
    {
      gasPrice: 0n
    }
  );

  const receipt = await tx.wait();

  console.log(
    JSON.stringify(
      {
        contractAddress,
        txHash: receipt?.hash || tx.hash,
        noteSummary: draft.summary,
        explorerUrl: `${process.env.STATUS_EXPLORER_URL || "https://sepoliascan.status.network"}/tx/${receipt?.hash || tx.hash}`
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("StatusZeroGasNotary", (m) => {
  const notary = m.contract("StatusZeroGasNotary");

  return { notary };
});


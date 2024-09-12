import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const Web3CXIModule = buildModule("Web3CXIModule", (m) => {

  const web3CXI = m.contract("Web3CXI", [], {
  });

  return { web3CXI };
});

export default Web3CXIModule;

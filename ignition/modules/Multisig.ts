import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultisigModule = buildModule("MultisigModule", (m) => {

  const multisig = m.contract("Multisig", [4, ["0x10f2e3027fCCc4288113c3B814bBbcB959Fc5520", "0xaF3F8de47b091c98b455F981518E57Ec21dcf470", "0x8B286eF43CcB1B3842f925e3BEF8B712BE408035"]], {
  });

  return { multisig };
});

export default MultisigModule;



// Web3CXIModule#Web3CXI - 0xb264D760D079EfeC7cCD98F65287458C2a91A26C
// MultisigModule#Multisig - 0x06e48399d9b9a8159Db4180a9123F81a979f5545
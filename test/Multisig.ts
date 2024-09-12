import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, {ethers} from "hardhat";

describe("Multisig Contract - Deployment", function () {
  // Fixture to deploy both the Multisig and Web3CXI contracts with quorum 3 and 6 valid signers
  async function deployContractsFixture() {
    // Get signers: owner, and 5 other signers
    const [owner, otherSigner1, otherSigner2, otherSigner3, otherSigner4, otherSigner5] = await hre.ethers.getSigners();

    // Deploy the Web3CXI (ERC20 token) contract
    const Web3CXI = await hre.ethers.getContractFactory("Web3CXI");
    const web3CXI = await Web3CXI.deploy();

    // Get the initial balance of the owner from the minting contract
    const initialTokenBalance = await web3CXI.balanceOf(owner.address);

    // Deploy the Multisig contract
    const Multisig = await hre.ethers.getContractFactory("Multisig");

    // Set quorum to 3
    const quorum = 3;
    
    // Set valid signers to 6 signers
    const validSigners = [
      owner.address,
      otherSigner1.address,
      otherSigner2.address,
      otherSigner3.address,
      otherSigner4.address,
      otherSigner5.address
    ];

    return { Multisig, web3CXI, owner, otherSigner1, otherSigner2, otherSigner3, otherSigner4, otherSigner5, quorum, validSigners, initialTokenBalance };
  }

  // Test for valid deployment with quorum 3 and 6 valid signers
  it("Should deploy with quorum 3 and 6 valid signers", async function () {
    const { Multisig, quorum, validSigners } = await loadFixture(deployContractsFixture);

    // Deploy the Multisig contract with a valid quorum of 3
    const multisig = await Multisig.deploy(quorum, validSigners);

    // Check if the quorum is set to 3
    expect(await multisig.quorum()).to.equal(quorum);

    // Check if the number of valid signers is set to 6
    expect(await multisig.noOfValidSigners()).to.equal(validSigners.length);
  });

  // Test the deployment of the Web3CXI contract to ensure it is correctly initialized
  it("Should deploy the Web3CXI contract and mint initial tokens to the owner", async function () {
    const { web3CXI, owner, initialTokenBalance } = await loadFixture(deployContractsFixture);

    // Verify that the initial token balance is correct (100,000 WCXI tokens, multiplied by 1e18)
    expect(await web3CXI.balanceOf(owner.address)).to.equal(initialTokenBalance);
  });
});

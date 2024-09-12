import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("Multisig with Web3CXI Token", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployMultisigWithTokenFixture() {
    // Get signers for testing
    const [owner, signer1, signer2, signer3, signer4, signer5, signer6] = await ethers.getSigners();

    // Deploy the Web3CXI token contract (Minting contract)
    const Web3CXI = await ethers.getContractFactory("Web3CXI");
    const web3CXI = await Web3CXI.deploy();  // No need to call .deployed()

    // Initial token supply is 100,000 tokens (already minted to the owner by default)
    const initialSupply = await web3CXI.balanceOf(owner.address);

    // Define a quorum of 4 signers
    const quorum = 4;

    // Define valid signers (6 signers in total)
    const validSigners = [owner.address, signer1.address, signer2.address, signer3.address, signer4.address, signer5.address];

    // Deploy the Multisig contract with the quorum and valid signers
    const Multisig = await ethers.getContractFactory("Multisig");
    const multisig = await Multisig.deploy(quorum, validSigners);  // No need to call .deployed()

    // Return the contracts and key values needed for the tests
    return { web3CXI, multisig, owner, signer1, signer2, signer3, signer4, signer5, signer6, initialSupply, quorum, validSigners };
  }

  describe("Deployment", function () {

    // 1. Successful Deployment with Valid Inputs
    it("1. Should deploy Web3CXI token and Multisig contract with valid inputs correctly", async function () {
      // Load the fixture to get the values
      const { web3CXI, multisig, owner, initialSupply } = await loadFixture(deployMultisigWithTokenFixture);

      // Check if the Web3CXI token was deployed with the correct initial supply
      expect(initialSupply).to.equal(ethers.parseEther("100000"));

      // Check if the owner of the token is set correctly
      expect(await web3CXI.owner()).to.equal(owner.address);

      // Check if the multisig contract was deployed with the correct quorum
      expect(await multisig.quorum()).to.equal(4);

      // Check the number of valid signers (should match the input list)
      expect(await multisig.noOfValidSigners()).to.equal(6);
    });

    it("2. Should set the valid signers correctly", async function () {
      const { multisig, owner, signer1, signer2, signer3, signer4, signer5 } = await loadFixture(deployMultisigWithTokenFixture);

      // Check that all valid signers are correctly set
      expect(await multisig.isValidSigner(owner.address)).to.equal(true);
      expect(await multisig.isValidSigner(signer1.address)).to.equal(true);
      expect(await multisig.isValidSigner(signer2.address)).to.equal(true);
      expect(await multisig.isValidSigner(signer3.address)).to.equal(true);
      expect(await multisig.isValidSigner(signer4.address)).to.equal(true);
      expect(await multisig.isValidSigner(signer5.address)).to.equal(true);
    });

    // 2. Too Few Signers
    it("3. Should fail deployment if there are too few signers", async function () {
      // Get signers for testing
      const [owner] = await ethers.getSigners();

      // Define a quorum of 2 (this would be irrelevant as the error should happen before quorum check)
      const quorum = 2;

      // Try deploying with only 1 signer (invalid case)
      const Multisig = await ethers.getContractFactory("Multisig");

      // Expect the constructor to revert with the "few valid signers" error
      await expect(Multisig.deploy(quorum, [owner.address])).to.be.revertedWith("few valid signers");
    });
  });
});

import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";  // Ensure correct import of ethers

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
      expect(initialSupply).to.equal(ethers.utils.parseEther("100000"));

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

    // 3. Zero Address as a Signer
    // it("4. Should fail deployment if one of the signers is the zero address", async function () {
    //   // Get signers for testing
    //   const [owner, signer1, signer2] = await ethers.getSigners();

    //   // Define a quorum of 2
    //   const quorum = 2;

    //   // Include zero address as one of the signers
    //   const zeroAddress = ethers.constants.AddressZero;

    //   // Try deploying the multisig contract with a zero address in the valid signers array
    //   const Multisig = await ethers.getContractFactory("Multisig");

    //   // Expect the constructor to revert with the "zero address not allowed" error
    //   await expect(Multisig.deploy(quorum, [owner.address, signer1.address, zeroAddress])).to.be.revertedWith("zero address not allowed");
    // });

    // 4. Duplicate Signers
    it("5. Should fail deployment if there are duplicate signers", async function () {
      // Get signers for testing
      const [owner, signer1, signer2] = await ethers.getSigners();

      // Define a quorum of 2
      const quorum = 2;

      // Try deploying the multisig contract with duplicate signers
      const Multisig = await ethers.getContractFactory("Multisig");

      // Expect the constructor to revert with the "signer already exist" error
      await expect(Multisig.deploy(quorum, [owner.address, signer1.address, signer1.address])).to.be.revertedWith("signer already exist");
    });

    // 5. Invalid Quorum Size (Too Small)
    it("6. Should fail deployment if the quorum is set to a value less than 2", async function () {
      // Get signers for testing
      const [owner, signer1, signer2] = await ethers.getSigners();

      // Define an invalid quorum of 1 (too small)
      const quorum = 1;

      // Try deploying the multisig contract with a quorum that is too small
      const Multisig = await ethers.getContractFactory("Multisig");

      // Expect the constructor to revert with the "quorum is too small" error
      await expect(Multisig.deploy(quorum, [owner.address, signer1.address, signer2.address])).to.be.revertedWith("quorum is too small");
    });

    // 6. Quorum Greater Than Number of Signers
    it("7. Should fail deployment if the quorum is greater than the number of valid signers", async function () {
      // Get signers for testing
      const [owner, signer1, signer2] = await ethers.getSigners();

      // Define a quorum greater than the number of signers (e.g., quorum is 4 but only 3 signers)
      const quorum = 4;

      // Try deploying the multisig contract with a quorum that is greater than the number of signers
      const Multisig = await ethers.getContractFactory("Multisig");

      // Expect the constructor to revert with the "quorum greater than valid signers" error
      await expect(Multisig.deploy(quorum, [owner.address, signer1.address, signer2.address])).to.be.revertedWith("quorum greater than valid signers");
    });

    // Transfer function tests
    describe("Transfer", function () {
      it("8. Should successfully initialize a token transfer", async function () {
        // Load the fixture to get the deployed contracts
        const { web3CXI, multisig, owner, signer1 } = await loadFixture(deployMultisigWithTokenFixture);

        // Transfer some tokens from the owner to the multisig contract for testing
        const transferAmount = ethers.parseEther("10000");
        await web3CXI.transfer(multisig.address, transferAmount);

        // Check the balance of the multisig contract
        expect(await web3CXI.balanceOf(multisig.address)).to.equal(transferAmount);

        // Set up the transfer parameters
        const amount = ethers.parseEther("5000");
        const recipient = signer1.address;
        const tokenAddress = web3CXI.address;

        // Call the transfer function from the owner (a valid signer)
        await expect(multisig.transfer(amount, recipient, tokenAddress))
          .to.emit(multisig, "TransactionInitiated")
          .withArgs(1, owner.address, recipient, amount, tokenAddress); // Check emitted event

        // Check that the transaction has been initialized with the correct values
        const transaction = await multisig.transactions(1);
        expect(transaction.id).to.equal(1);
        expect(transaction.amount).to.equal(amount);
        expect(transaction.sender).to.equal(owner.address);
        expect(transaction.recipient).to.equal(recipient);
        expect(transaction.tokenAddress).to.equal(tokenAddress);
        // Check that the transaction has been initialized with the correct values
        const transaction = await multisig.transactions(1);
        expect(transaction.id).to.equal(1);
        expect(transaction.amount).to.equal(amount);
        expect(transaction.sender).to.equal(owner.address);
        expect(transaction.recipient).to.equal(recipient);
        expect(transaction.tokenAddress).to.equal(tokenAddress);

        // Verify the transaction's approval count and signers
        expect(transaction.noOfApproval).to.equal(1); // Should be approved by the initiator (owner)
        expect(transaction.isCompleted).to.equal(false); // Transaction should not be completed yet

        // Ensure the initiator is recorded as a signer for this transaction
        const hasSigned = await multisig.hasSigned(owner.address, 1);
        expect(hasSigned).to.equal(true);

        // Check that the recipient has not signed
        const recipientHasSigned = await multisig.hasSigned(signer1.address, 1);
        expect(recipientHasSigned).to.equal(false);
      });
    });
  });
});


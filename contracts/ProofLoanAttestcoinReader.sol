// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Small integration boundary for ProofLoan.
/// @dev The current Attestcoin/Creditcoin v2 docs identify the native
///      Block Prover precompile at 0x0FD2. Keep the ABI isolated here so
///      upgrades to the protocol surface do not leak into the application.
interface IAttestcoinBlockProver {
    function verify(
        uint256 chainKey,
        uint256 blockNumber,
        bytes calldata txBytes,
        bytes calldata merkleProof,
        bytes calldata continuityProof
    ) external view returns (bool);
}

contract ProofLoanAttestcoinReader {
    address public constant BLOCK_PROVER = address(0x0FD2);

    error ProofRejected();
    error EmptyProof();

    struct VerifiedSourceTransaction {
        uint256 chainKey;
        uint256 sourceBlock;
        bytes32 transactionHash;
        bytes32 proofFingerprint;
        bool verified;
    }

    mapping(bytes32 => VerifiedSourceTransaction) public verifiedTransactions;

    event SourceTransactionVerified(
        bytes32 indexed transactionHash,
        uint256 indexed chainKey,
        uint256 sourceBlock,
        bytes32 proofFingerprint
    );

    function verifyAndRecord(
        uint256 chainKey,
        uint256 sourceBlock,
        bytes calldata txBytes,
        bytes calldata merkleProof,
        bytes calldata continuityProof,
        bytes32 transactionHash
    ) external returns (bytes32 fingerprint) {
        if (txBytes.length == 0 || merkleProof.length == 0 || continuityProof.length == 0) {
            revert EmptyProof();
        }

        bool ok = IAttestcoinBlockProver(BLOCK_PROVER).verify(
            chainKey,
            sourceBlock,
            txBytes,
            merkleProof,
            continuityProof
        );

        if (!ok) revert ProofRejected();

        fingerprint = keccak256(
            abi.encode(
                "ProofLoan",
                "Attestcoin Protocol",
                chainKey,
                sourceBlock,
                transactionHash,
                keccak256(txBytes),
                keccak256(merkleProof),
                keccak256(continuityProof)
            )
        );

        verifiedTransactions[transactionHash] = VerifiedSourceTransaction({
            chainKey: chainKey,
            sourceBlock: sourceBlock,
            transactionHash: transactionHash,
            proofFingerprint: fingerprint,
            verified: true
        });

        emit SourceTransactionVerified(
            transactionHash,
            chainKey,
            sourceBlock,
            fingerprint
        );
    }
}

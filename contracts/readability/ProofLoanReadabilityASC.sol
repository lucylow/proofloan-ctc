// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice ProofLoan readability ASC skeleton.
/// @dev Educational integration boundary. Wire the canonical Attestcoin
///      Block Prover ABI before any production deployment. The documented
///      precompile is 0x0FD2. This contract does not invent protocol fees
///      or unofficial chainkeys.
interface IAttestcoinBlockProver {
    function verify(
        uint256 chainKey,
        uint256 blockNumber,
        bytes calldata txBytes,
        bytes calldata merkleProof,
        bytes calldata continuityProof
    ) external view returns (bool);
}

contract ProofLoanReadabilityASC {
    address public constant BLOCK_PROVER = address(0x0FD2);

    mapping(bytes32 => bool) public processedQueries;

    event ReadabilityVerified(
        bytes32 indexed queryKey,
        uint256 indexed chainKey,
        uint256 indexed blockHeight,
        bytes32 transactionHash
    );
    event ReadabilityRejected(bytes32 indexed queryKey, string reason);

    error AlreadyProcessed();
    error ProofRejected();
    error ReceiptFailed();
    error EmptyProof();

    function queryKey(
        uint256 chainKey,
        uint256 blockHeight,
        uint256 transactionIndex,
        uint256 logIndex
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(chainKey, blockHeight, transactionIndex, logIndex));
    }

    function verifyAndConsume(
        uint256 chainKey,
        uint256 blockHeight,
        uint256 transactionIndex,
        uint256 logIndex,
        bytes calldata encodedTransaction,
        bytes calldata merkleProof,
        bytes calldata continuityProof,
        uint8 receiptStatus,
        bytes32 transactionHash
    ) external returns (bytes32 key) {
        key = queryKey(chainKey, blockHeight, transactionIndex, logIndex);
        if (processedQueries[key]) revert AlreadyProcessed();
        if (encodedTransaction.length == 0 || merkleProof.length == 0 || continuityProof.length == 0) {
            revert EmptyProof();
        }
        if (receiptStatus != 1) revert ReceiptFailed();

        bool ok = IAttestcoinBlockProver(BLOCK_PROVER).verify(
            chainKey,
            blockHeight,
            encodedTransaction,
            merkleProof,
            continuityProof
        );
        if (!ok) {
            emit ReadabilityRejected(key, "block prover rejected proof");
            revert ProofRejected();
        }

        processedQueries[key] = true;
        emit ReadabilityVerified(key, chainKey, blockHeight, transactionHash);
    }
}

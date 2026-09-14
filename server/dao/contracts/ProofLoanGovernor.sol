// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Prototype governance controller for ProofLoan.
/// @dev This is a demo/integration boundary, not an audited production DAO.
///      Compile with evmVersion shanghai for Creditcoin Frontier (CC3).
contract ProofLoanGovernor {
    enum Choice { Against, For, Abstain }
    struct Proposal { uint256 start; uint256 end; uint256 eta; bool executed; bool cancelled; bytes32 actionsHash; }
    mapping(bytes32 => Proposal) public proposals;
    mapping(bytes32 => mapping(address => uint256)) public votingPowerUsed;
    uint256 public quorumBps = 1000;
    uint256 public approvalBps = 5000;
    uint256 public executionDelay = 1 days;
    address public guardian;
    event ProposalCreated(bytes32 indexed id, bytes32 indexed actionsHash, uint256 start, uint256 end);
    event VoteCast(bytes32 indexed id, address indexed voter, Choice choice, uint256 weight);
    event ProposalQueued(bytes32 indexed id, uint256 eta);
    event ProposalExecuted(bytes32 indexed id);
    event EmergencyCancelled(bytes32 indexed id, address indexed guardian);

    error InvalidGuardian();

    constructor(address guardian_) {
        if (guardian_ == address(0)) revert InvalidGuardian();
        guardian = guardian_;
    }
    function propose(bytes32 id, bytes32 actionsHash, uint256 start, uint256 end) external {
        require(proposals[id].start == 0, "exists"); require(start < end, "window");
        proposals[id] = Proposal(start,end,0,false,false,actionsHash); emit ProposalCreated(id,actionsHash,start,end);
    }
    function castVote(bytes32 id, Choice choice, uint256 weight) external {
        Proposal storage p=proposals[id]; require(block.timestamp>=p.start && block.timestamp<=p.end,"inactive");
        require(weight>0,"weight"); require(votingPowerUsed[id][msg.sender]==0,"already voted");
        votingPowerUsed[id][msg.sender]=weight; emit VoteCast(id,msg.sender,choice,weight);
    }
    function queue(bytes32 id) external { Proposal storage p=proposals[id]; require(!p.executed&&!p.cancelled,"closed"); require(block.timestamp>p.end,"not ended"); p.eta=block.timestamp+executionDelay; emit ProposalQueued(id,p.eta); }
    function execute(bytes32 id) external { Proposal storage p=proposals[id]; require(p.eta!=0 && block.timestamp>=p.eta,"timelock"); p.executed=true; emit ProposalExecuted(id); }
    function emergencyCancel(bytes32 id) external { require(msg.sender==guardian,"guardian"); proposals[id].cancelled=true; emit EmergencyCancelled(id,msg.sender); }
}

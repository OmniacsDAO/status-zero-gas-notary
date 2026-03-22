// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract StatusZeroGasNotary {
    // Deliberately open: the product is a public accountability rail where any
    // human or agent can notarize a record without waiting on a privileged role.
    enum RecordKind {
        Milestone,
        Delivery,
        Observation,
        Incident,
        Commitment,
        Request
    }

    struct Record {
        uint256 id;
        address author;
        uint64 createdAt;
        RecordKind kind;
        bytes32 contentHash;
        bytes32 contextHash;
        string summary;
        string uri;
    }

    uint256 public nextRecordId = 1;
    mapping(uint256 => Record) private records;

    event RecordNotarized(
        uint256 indexed id,
        address indexed author,
        RecordKind indexed kind,
        bytes32 contentHash,
        bytes32 contextHash,
        string summary,
        string uri
    );

    function notarize(
        RecordKind kind,
        bytes32 contentHash,
        bytes32 contextHash,
        string calldata summary,
        string calldata uri
    ) external returns (uint256 id) {
        require(contentHash != bytes32(0), "missing content hash");
        require(contextHash != bytes32(0), "missing context hash");
        require(bytes(summary).length > 0, "missing summary");
        // Keep summaries short so the onchain note stays cheap and readable.
        require(bytes(summary).length <= 140, "summary too long");

        id = nextRecordId;
        nextRecordId += 1;

        records[id] = Record({
            id: id,
            author: msg.sender,
            createdAt: uint64(block.timestamp),
            kind: kind,
            contentHash: contentHash,
            contextHash: contextHash,
            summary: summary,
            uri: uri
        });

        emit RecordNotarized(id, msg.sender, kind, contentHash, contextHash, summary, uri);
    }

    function getRecord(uint256 id) external view returns (Record memory) {
        require(records[id].id != 0, "record not found");
        return records[id];
    }
}

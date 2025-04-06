// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Voting{
    struct Candidate{
        string name;
        uint256 voteCount;
    }

     Candidate[] public candidates;
     address owner;
     mapping (address => bool) public voters;  

     uint256 public votingStart;
     uint256 public votingEnd;

     constructor(uint256 _durationInMinutes) {
    owner = msg.sender;
    votingStart = block.timestamp;
    votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
    }


    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function getOwner() public view returns (address) {
    return owner;
    }


    function addCandidate(string memory _name) public onlyOwner {
        candidates.push(Candidate({
            name: _name,
            voteCount:  0
        }));
    }

    function deleteCandidate(uint index) public onlyOwner {
    require(index < candidates.length, "Invalid index");
    for (uint i = index; i < candidates.length - 1; i++) {
        candidates[i] = candidates[i + 1];
    }
    candidates.pop();
}


    function vote(uint256 _candidateIndex) public {
        require(!voters[msg.sender], "You have already Voted !!");
        require(_candidateIndex < candidates.length, "Inavlid Candidate Index");
 
        candidates[_candidateIndex].voteCount++;
        voters[msg.sender] = true;
         
    }

    function getAllVotesCandidates() public view returns(Candidate[] memory){
        return candidates;
    }

    function getVotingStatus() public view returns (bool) {
        return (block.timestamp >= votingStart && block.timestamp < votingEnd);
    }

    function getRemainingTime() public view returns (uint256){
        require(block.timestamp >= votingStart, "Voting has not started yet!!");
        if (block.timestamp >= votingEnd){
            return 0;
        }
        return votingEnd - block.timestamp;
    }

}
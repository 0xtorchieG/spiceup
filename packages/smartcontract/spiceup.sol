// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}
contract RunningChallenge is Ownable {

    constructor() Ownable(msg.sender) {}

    enum ChallengeType { RunDistance, RunTime, HeartRate }

    // Structure to represent a challenge
    struct Challenge {
        uint256 id;
        string title;
        uint256 goalValue;
        uint256 startTime;
        uint256 endTime;
        address creator;
        uint256 prizePool;
        address tokenAddress; // if token gating is enabled this address is required
        ChallengeType challengeType; // Type of challenge
        mapping(address => uint256) participantValue;
        mapping(address => bool) claimedPrize;
        mapping(address => uint256) claimedPrizeAmount;
        address[] participants;
        bool active;
        bool feeClaimed;
        bool tokenGateEnabled;
    }

    // Array to store challenges
    Challenge[] public challenges;

    // Mapping to track participant's entry status for each challenge
    mapping(uint256 => mapping(address => bool)) public participantEntered;

    // Mapping to track if an activity has been logged for a participant across all challenges
    mapping(address => mapping(uint256 => bool)) public activityLogged;

    // Mapping to track if an activity has been logged for a participant across all challenges
    mapping(address => uint256) public claimedPrizesAmount;
    
    // Mapping to track challenge IDs by creator's address
    mapping(address => uint256[]) public challengesCreatedByCreator;

    // Mapping to track challenge IDs by participant's address
    mapping(address => uint256[]) public challengesEnteredByParticipant;

    // Event to log challenge creation
    event ChallengeCreated(uint256 indexed id, string title, uint256 goalValue, uint256 startTime, uint256 endTime, address indexed creator, address tokenAddress, ChallengeType challengeType, bool tokenGateEnabled);

    // Modifier to restrict access to challenge creator only
    modifier onlyCreator(uint256 _challengeId) {
        require(msg.sender == challenges[_challengeId].creator, "Only challenge creator can perform this action");
        _;
    }

    // Function to create a new challenge
    function createChallenge(string memory _title, uint256 _goalValue, uint256 _startTime, uint256 _durationSeconds, address _tokenAddress, ChallengeType _challengeType, bool _tokenGateEnabled) external payable {
        require(_goalValue > 0, "Goal value must be greater than zero");
        require(_startTime >= block.timestamp, "Start time must be in the future");
        require(_durationSeconds > 0, "Duration must be greater than zero");

        // Increment challenge ID
        uint256 challengeId = challenges.length;

        // Calculate end time
        uint256 endTime = _startTime + _durationSeconds;

        // Add challenge to array
        challenges.push();


        uint256 challengeIndex = challenges.length - 1;
        Challenge storage newChallenge = challenges[challengeIndex];
        newChallenge.id = challengeId;
        newChallenge.title = _title;
        newChallenge.goalValue = _goalValue;
        newChallenge.startTime = _startTime;
        newChallenge.endTime = endTime;
        newChallenge.creator = msg.sender;
        newChallenge.prizePool = msg.value;
        newChallenge.tokenAddress = _tokenAddress;
        newChallenge.challengeType = _challengeType;
        newChallenge.active = true;
        newChallenge.tokenGateEnabled = _tokenGateEnabled;
        newChallenge.feeClaimed = false;


        // Initialize mappings separately
        address[] memory participants = newChallenge.participants;
        for (uint256 i = 0; i < participants.length; i++) {
            newChallenge.participantValue[participants[i]] = 0;
            newChallenge.claimedPrize[participants[i]] = false;
            newChallenge.claimedPrizeAmount[participants[i]] = 0;
        }

        // Add challenge ID to challengesCreatedByCreator mapping
        challengesCreatedByCreator[msg.sender].push(challengeId);

        emit ChallengeCreated(challengeId, _title, _goalValue, _startTime, endTime, msg.sender, _tokenAddress, _challengeType, _tokenGateEnabled);
    }

    // Function to participate in a challenge
    function enterChallenge(uint256 _challengeId) external {
        require(challenges[_challengeId].active, "Challenge is not active");
        require(block.timestamp >= challenges[_challengeId].startTime, "Challenge has not started yet");
        require(block.timestamp < challenges[_challengeId].endTime, "Challenge has expired");
        require(participantEntered[_challengeId][msg.sender] == false, "You have already entered this challenge");

        // If token gating is enabled, check participant's token balance
        if (challenges[_challengeId].tokenGateEnabled) {
            require(challenges[_challengeId].tokenAddress != address(0), "Token gating is enabled but token address is not provided");

            IERC20 token = IERC20(challenges[_challengeId].tokenAddress);
            require(token.balanceOf(msg.sender) > 0, "You do not have required tokens to enter the challenge");

        }

        // Mark participant as entered
        participantEntered[_challengeId][msg.sender] = true;
        // Initialize claimedPrize to false when participant enters the challenge
        challenges[_challengeId].claimedPrize[msg.sender] = false;

        // Add challenge ID to challengesEnteredByParticipant mapping
        challengesEnteredByParticipant[msg.sender].push(_challengeId);

        // Add participant to challenge participants array
        challenges[_challengeId].participants.push(msg.sender);
    }

    // Function to log participant's value
    function logValue(uint256 _challengeId, uint256 _value, uint256 _activityId) external {
        require(challenges[_challengeId].active, "Challenge is not active");
        require(block.timestamp >= challenges[_challengeId].startTime, "Challenge has not started yet");
        require(block.timestamp < challenges[_challengeId].endTime, "Challenge has expired");
        require(_value >= challenges[_challengeId].goalValue, "The value to be logged needs to be larger than minimum entry");
        require(participantEntered[_challengeId][msg.sender], "You are not a participant in this challenge");

        // Ensure the activity has not been logged before
        require(!activityLogged[msg.sender][_activityId], "Activity already logged");

        // Update value based on challenge type
        if (challenges[_challengeId].challengeType == ChallengeType.HeartRate) {
            require(_value > challenges[_challengeId].participantValue[msg.sender], "New value must be higher than already logged heartrate");
            
            // Update heartrate value
            challenges[_challengeId].participantValue[msg.sender] = _value;
        }

        // Update value based on challenge type
        if (challenges[_challengeId].challengeType != ChallengeType.HeartRate) {
            
            // Add value to participant's total value 
            challenges[_challengeId].participantValue[msg.sender]+= _value;
        }

        // Mark activity as logged for the participant
        activityLogged[msg.sender][_activityId] = true;
    }


    // Function to get leaderboard
    function getLeaderboard(uint256 _challengeId) external view returns (address[] memory, uint256[] memory) {
        address[] memory leaderboard = new address[](10);
        uint256[] memory values = new uint256[](10);

        for (uint256 i = 0; i < challenges[_challengeId].participants.length; i++) {
            address participant = challenges[_challengeId].participants[i];
            uint256 value = challenges[_challengeId].participantValue[participant];

            for (uint256 j = 0; j < 10; j++) {
                if (value > values[j]) {
                    for (uint256 k = 9; k > j; k--) {
                        leaderboard[k] = leaderboard[k - 1];
                        values[k] = values[k - 1];
                    }
                    leaderboard[j] = participant;
                    values[j] = value;
                    break;
                }
            }
        }

        return (leaderboard, values);
    }

    // Function to claim prize money
    function claimPrize(uint256 _challengeId) external {
        require(block.timestamp >= challenges[_challengeId].endTime, "Challenge is has not yet finished");
        require(participantEntered[_challengeId][msg.sender], "You are not a participant in this challenge");
        require(challenges[_challengeId].claimedPrize[msg.sender] == false, "You have already claimed your prize");
        require(msg.sender != address(0), "Invalid address");

        uint256 prizeAmount = calculatePrizeAmount(_challengeId, msg.sender);
        require(prizeAmount > 0, "You are not eligible to claim a prize");

        challenges[_challengeId].claimedPrize[msg.sender] = true;
        claimedPrizesAmount[msg.sender] += prizeAmount;

        payable(msg.sender).transfer(prizeAmount);
    }

    // calculate the prize amount to claim
    function calculatePrizeAmount(uint256 _challengeId, address _participant) internal view returns (uint256) {
        address[] memory leaderboard = new address[](10);
        uint256[] memory values = new uint256[](10);

        for (uint256 i = 0; i < challenges[_challengeId].participants.length; i++) {
            address participant = challenges[_challengeId].participants[i];
            uint256 value = challenges[_challengeId].participantValue[participant];

            for (uint256 j = 0; j < 10; j++) {
                if (value > values[j]) {
                    for (uint256 k = 9; k > j; k--) {
                        leaderboard[k] = leaderboard[k - 1];
                        values[k] = values[k - 1];
                    }
                    leaderboard[j] = participant;
                    values[j] = value;
                    break;
                }
            }
        }

        for (uint256 i = 0; i < 3; i++) {
            if (i < leaderboard.length && leaderboard[i] == _participant) {
                if (i == 0) return challenges[_challengeId].prizePool * 50 / 100; // 50% for spot 1
                if (i == 1) return challenges[_challengeId].prizePool * 30 / 100; // 30% for spot 2
                if (i == 2) return challenges[_challengeId].prizePool * 15 / 100; // 15% for spot 3
            }
        }
        return 0; // Not in top 3, no prize
    }

    // Function for the contract owner to claim the fee of 5% of the prize pool when the challenge is over to fund development and operations of the dApp
    function claimFee(uint256 _challengeId) external onlyOwner {
        require(block.timestamp >= challenges[_challengeId].endTime, "Challenge has not yet finished");
        require(challenges[_challengeId].prizePool > 0, "No prize pool available for this challenge");
        require(challenges[_challengeId].feeClaimed == false, "Fee is already claimed for this challenge");
        require(msg.sender != address(0), "Invalid address");


        // Calculate the fee amount (5% of the prize pool)
        uint256 feeAmount = (challenges[_challengeId].prizePool * 5) / 100;
        challenges[_challengeId].feeClaimed = true;

        // Transfer the fee amount to the owner
        payable(owner()).transfer(feeAmount);
    }

    // Function to set challenge active status
    function setChallengeActive(uint256 _challengeId, bool _active) external onlyCreator(_challengeId) {
        challenges[_challengeId].active = _active;
    }

    // Function to get the number of active challenges
    function getChallengesCount() external view returns (uint256) {
        uint256 count = challenges.length;
        return count;
    }

    // Function to get challenge IDs created by a specific creator address
    function getChallengesCreatedByCreator(address _creator) external view returns (uint256[] memory) {
        return challengesCreatedByCreator[_creator];
    }

        // Function to get challenge IDs created by a specific creator address
    function getChallengesEnteredByParticipant(address _participant) external view returns (uint256[] memory) {
        return challengesEnteredByParticipant[_participant];
    }
}


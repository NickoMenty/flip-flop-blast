// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

error Raffle_NotEnoughETH();
error Raffle_TransferFailed();
error Raffle_NotOpen();
error Raffle_UpKeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);
error Raffle_HasMoney();
error Raffle_AlreadyOpen();
error Raffle_IncorrectStakeAmount();
error Raffle_noFundsToWithdraw();
error Raffle_AlreadyStaked();


enum YieldMode {
    AUTOMATIC,
    VOID,
    CLAIMABLE
}

enum GasMode {
    VOID,
    CLAIMABLE 
}

interface IBlast{
    // configure
    function configureContract(address contractAddress, YieldMode _yield, GasMode gasMode, address governor) external;
    function configure(YieldMode _yield, GasMode gasMode, address governor) external;

    // base configuration options
    function configureClaimableYield() external;
    function configureClaimableYieldOnBehalf(address contractAddress) external;
    function configureAutomaticYield() external;
    function configureAutomaticYieldOnBehalf(address contractAddress) external;
    function configureVoidYield() external;
    function configureVoidYieldOnBehalf(address contractAddress) external;
    function configureClaimableGas() external;
    function configureClaimableGasOnBehalf(address contractAddress) external;
    function configureVoidGas() external;
    function configureVoidGasOnBehalf(address contractAddress) external;
    function configureGovernor(address _governor) external;
    function configureGovernorOnBehalf(address _newGovernor, address contractAddress) external;

    // claim yield
    function claimYield(address contractAddress, address recipientOfYield, uint256 amount) external returns (uint256);
    function claimAllYield(address contractAddress, address recipientOfYield) external returns (uint256);

    // claim gas
    function claimAllGas(address contractAddress, address recipientOfGas) external returns (uint256);
    function claimGasAtMinClaimRate(address contractAddress, address recipientOfGas, uint256 minClaimRateBips) external returns (uint256);
    function claimMaxGas(address contractAddress, address recipientOfGas) external returns (uint256);
    function claimGas(address contractAddress, address recipientOfGas, uint256 gasToClaim, uint256 gasSecondsToConsume) external returns (uint256);

    // read functions
    function readClaimableYield(address contractAddress) external view returns (uint256);
    function readYieldConfiguration(address contractAddress) external view returns (uint8);
    function readGasParams(address contractAddress) external view returns (uint256 etherSeconds, uint256 etherBalance, uint256 lastUpdated, GasMode);
}

contract Raffle is Ownable{
    
    /* Type declarations */
    enum RaffleState {
        OPEN,
        CALCULATING
    } // uint256 0 = open, 1 = calculating

    /* STATE VARIABLES */
    uint256 private immutable i_enteranceFee;
    address payable[] private s_players;
    address private immutable i_owner;
    uint256 public s_stakeAmount = 6900000000000000;
    mapping(address => bool) public s_stakedPlayers;
    mapping(address => uint256) private s_stakedAmounts;
    uint256 private s_rafflePool;

    // LOTTERY VARIABLES
    address payable s_recentWinner;
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    mapping(address => bool) private s_hasReceivedExtraEntries;
    mapping(uint256 => mapping(address => uint256)) private s_extraEntriesCounter;
    mapping(uint256 => mapping(address => uint256)) private s_playerEntries;
    uint256 public s_closeRaffleCounter;
    mapping(address => uint256) public s_dayWhenStaked;
    IBlast immutable i_blast;

    /* EVENTS */
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    constructor(
        uint256 enteranceFee
    ) {
        
        i_owner = msg.sender;
        i_enteranceFee = enteranceFee;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_blast = IBlast(0x4300000000000000000000000000000000000002);
        i_blast.configureClaimableYield();
        i_blast.configureClaimableGas();
    }

    function enterRaffle(uint256 numberOfEntries) public payable {
        require(numberOfEntries >= 1, "zero entries is not permitted!");
        if (msg.value < i_enteranceFee * numberOfEntries) {
            revert Raffle_NotEnoughETH();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle_NotOpen();
        }
        s_rafflePool += i_enteranceFee;

        for (uint256 i = 0; i < numberOfEntries; i++) {
            s_players.push(payable(msg.sender));
            s_playerEntries[s_closeRaffleCounter][msg.sender]++;
        }

        if(s_stakedPlayers[msg.sender] && !s_hasReceivedExtraEntries[msg.sender]) {
            uint256 daysStaked = s_closeRaffleCounter - s_dayWhenStaked[msg.sender];
            if(daysStaked >= 7){
                s_extraEntriesCounter[s_closeRaffleCounter][msg.sender]++;
            }
            if(daysStaked >= 14){
                s_extraEntriesCounter[s_closeRaffleCounter][msg.sender]++;
            }
            s_extraEntriesCounter[s_closeRaffleCounter][msg.sender]++;
            uint256 extraEntries = s_extraEntriesCounter[s_closeRaffleCounter][msg.sender];
            for (uint256 i = 0; i < extraEntries; i++) {
                s_players.push(payable(msg.sender)); 
            }
            s_hasReceivedExtraEntries[msg.sender] = true;
        }
       emit RaffleEnter(msg.sender);
    }

    function openRaffle() public onlyOwner {
        if (s_raffleState == RaffleState.OPEN) {
            revert Raffle_AlreadyOpen();
        }
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
    }

    function closeRaffle() public onlyOwner{
        require(s_players.length > 0, "No players in raffle");

        s_raffleState = RaffleState.CALCULATING;
        s_closeRaffleCounter++; 
        uint256 randonNumber = random();
        uint256 indexOfWinner = randonNumber % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;

        for (uint256 i = 0; i < s_players.length; i++) {
            s_hasReceivedExtraEntries[s_players[i]] = false;
        }

        s_players = new address payable[](0);

        (bool success, ) = recentWinner.call{value: s_rafflePool}("");
        if (!success) {
            revert Raffle_TransferFailed();
        }
        s_rafflePool = 0;

        emit WinnerPicked(recentWinner);
        s_raffleState = RaffleState.OPEN;
    }

    function stake() public payable {
        if (s_stakedPlayers[msg.sender]){
            revert Raffle_AlreadyStaked();
        }
        if (msg.value != s_stakeAmount){
            revert Raffle_IncorrectStakeAmount();
        }
        s_stakedAmounts[msg.sender] += msg.value;
        s_stakedPlayers[msg.sender] = true;
        s_dayWhenStaked[msg.sender] = s_closeRaffleCounter;
    }

    function withdrawStake() public {
        uint256 stakedAmount = s_stakedAmounts[msg.sender];
        if (stakedAmount <= 0){
            revert Raffle_noFundsToWithdraw();
        }
        s_stakedAmounts[msg.sender] = 0;
        s_stakedPlayers[msg.sender] = false; 

        (bool success, ) = msg.sender.call{value: stakedAmount}("");
        if (!success) {
            revert Raffle_TransferFailed();
        }
        s_extraEntriesCounter[s_closeRaffleCounter][msg.sender] = 0;
    }

    function random() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
        tx.origin,
        blockhash(block.number - 1),
        block.timestamp
        )));
    }

    function changeStakeAmount(uint256 weiAmount) public onlyOwner{
        s_stakeAmount = weiAmount;
    }

    /* Blast fynctions */
    function claimYield(address recipient, uint256 amount) external onlyOwner{
		i_blast.claimYield(address(this), recipient, amount);
    }
    function claimAllYield(address recipient) external onlyOwner{
		i_blast.claimAllYield(address(this), recipient);
    }
    function claimAllGas(address recipient) external onlyOwner{
		i_blast.claimAllGas(address(this), recipient);
    }
    function claimGasAtMinClaimRate(address recipient, uint256 minClaimRateBips) external onlyOwner{
		i_blast.claimGasAtMinClaimRate(address(this), recipient, minClaimRateBips);
    }
    function claimMaxGas(address recipient) external onlyOwner{
		i_blast.claimMaxGas(address(this), recipient);
    }

    /* Blast view fynctions */
    function readClaimableYield() public view returns (uint256) {
        return i_blast.readClaimableYield(address(this));
    }

    function readGasParams() public view returns (uint256 etherSeconds, uint256 etherBalance, uint256 lastUpdated, GasMode) {
        return i_blast.readGasParams(address(this));
    }


    /* View / Pure functions */
    function getEntranceFee() public view returns (uint256) {
        return i_enteranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimestamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }
    
    function hasStaked(address player) public view returns (bool) {
        return s_stakedPlayers[player];
    }

    function playerEntrances() public view returns (uint256) {
        uint256 allEntries = s_extraEntriesCounter[s_closeRaffleCounter][msg.sender] + s_playerEntries[s_closeRaffleCounter][msg.sender];
        return allEntries;
    }
}

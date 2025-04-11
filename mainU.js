let WALLET_CONNECTED = '';
let contractAddress = "0x50e3464D00272f0F269f23acaB2561f8610F7Be2";
let contractABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_durationInMinutes",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "candidates",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "voteCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "deleteCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllVotesCandidates",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "voteCount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Voting.Candidate[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRemainingTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVotingStatus",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateIndex",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "voters",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingEnd",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingStart",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const isWalletConnected = () => {
  if (!WALLET_CONNECTED || WALLET_CONNECTED === '') {
      Swal.fire("Not Connected", "Please connect MetaMask first.", "warning");
      return false;
  }
  return true;
};

const connectMetamask = async () => {
  if (typeof window.ethereum === "undefined") {
      Swal.fire("MetaMask Missing", "Please install MetaMask first.", "error");
      return;
  }
  try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      WALLET_CONNECTED = await signer.getAddress();
      
      // Update navbar UI
      document.getElementById("metamasknotification").innerText = "Connected: " + WALLET_CONNECTED;

      // Check admin access
      await checkAdmin();
  } catch (error) {
      console.error("MetaMask Connection Error:", error);
      Swal.fire("Connection Error", "Failed to connect MetaMask.", "error");
  }
};

// Listen for account changes and update UI dynamically
window.ethereum?.on("accountsChanged", async (accounts) => {
  if (accounts.length > 0) {
      WALLET_CONNECTED = accounts[0];
      document.getElementById("metamasknotification").innerText = "Connected: " + WALLET_CONNECTED;
      await checkAdmin();
  } else {
      WALLET_CONNECTED = "";
      document.getElementById("metamasknotification").innerText = "Not Connected";
  }
});

// Check if the connected user is the contract owner (Admin)
const checkAdmin = async () => {
  if (!isWalletConnected()) return;
  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const userAddress = await signer.getAddress();

  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
  try {
      const owner = await contract.getOwner(); 
      const adminLinks = document.getElementById("adminLinks");

      // Show admin options if the connected user is the owner
      if (userAddress.toLowerCase() === owner.toLowerCase()) {
          adminLinks.innerHTML = `<a href="ListVoters.html">List Voters</a>`;
      } else {
          adminLinks.innerHTML = ""; // Hide admin options
      }
  } catch (err) {
      console.error("Error checking admin:", err);
  }
};

const getAllCandidates = async () => {
  if (!isWalletConnected()) return;
  const p3 = document.getElementById("p3");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  p3.innerHTML = "Fetching candidates...";

  try {
      const candidates = await contract.getAllVotesCandidates();
      const tableBody = document.getElementById("candidatesTableBody");
      tableBody.innerHTML = "";

      if (candidates.length === 0) {
          p3.innerHTML = "No candidates added yet.";
          return;
      }

      candidates.forEach((candidate, i) => {
          const row = tableBody.insertRow();
          row.insertCell().innerHTML = i + 1;
          row.insertCell().innerHTML = candidate.name;
          row.insertCell().innerHTML = candidate.voteCount;

          const voteCell = row.insertCell();
          const voteButton = document.createElement("button");
          voteButton.innerHTML = "Vote";
          voteButton.style.backgroundColor = "#28a745";
          voteButton.style.color = "white";
          voteButton.style.border = "none";
          voteButton.style.padding = "6px 12px";
          voteButton.style.borderRadius = "6px";
          voteButton.style.cursor = "pointer";
          voteButton.onclick = () => addVote(i);  
          voteCell.appendChild(voteButton);
      });

      p3.innerHTML = "Candidate list updated.";
  } catch (err) {
      console.error("Error:", err);
      p3.innerHTML = "Failed to fetch candidates.";
  }
};

const voteStatus = async () => {
  if (!isWalletConnected()) return;
  const status = document.getElementById("status");
  const time = document.getElementById("time");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  try {
      const isVotingOpen = await contract.getVotingStatus();
      const remaining = await contract.getRemainingTime();
      const remainingSeconds = parseInt(remaining.toString());
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;
      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      status.innerHTML = isVotingOpen ? "Voting is OPEN" : "Voting has ENDED";
      time.innerHTML = `Remaining Time: ${formattedTime}`;
  } catch (err) {
      console.error("Error fetching status:", err);
      status.innerHTML = "Failed to fetch voting status.";
  }
};

const addVote = async (candidateIndex) => {
  if (!isWalletConnected()) return;

  try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const isVotingOpen = await contract.getVotingStatus();
      if (!isVotingOpen) {
          Swal.fire("Voting Closed", "Voting time has ended. You can't vote now.", "warning");
          return;
      }

      const tx = await contract.vote(candidateIndex);
      await tx.wait();

      Swal.fire("Success", "Your vote has been cast.", "success");
      getAllCandidates();  
  } catch (err) {
      console.error("Vote Error:", err);
      let errorMessage = "Vote failed.";
      if (err.reason) errorMessage = err.reason;
      else if (err.data && err.data.message) errorMessage = err.data.message;
      else if (err.message) errorMessage = err.message;

      Swal.fire("Error", errorMessage, "error");
  }
};

let WALLET_CONNECTED = '';
let contractAddress = "0x500aAA35b68621B778d99F289BD1Ee3eDc90B830";
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
    if (!WALLET_CONNECTED) {
        Swal.fire("Not Connected", "Please connect MetaMask first.", "warning");
        return false;
    }
    return true;
};

window.ethereum?.on("accountsChanged", async (accounts) => {
    if (accounts.length > 0) {
        WALLET_CONNECTED = accounts[0];
        document.getElementById("metamasknotification").innerText = "Connected: " + WALLET_CONNECTED;
        await checkAdmin();
        await voteStatus();
        await getAllCandidates();
    } else {
        WALLET_CONNECTED = "";
        document.getElementById("metamasknotification").innerText = "Not Connected";
    }
});

const checkAdmin = async () => {
    if (!isWalletConnected()) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
        const owner = await contract.getOwner();
        const adminLinks = document.getElementById("adminLinks");

        if (userAddress.toLowerCase() === owner.toLowerCase()) {
            adminLinks.innerHTML = `<a href="ListVoters.html">List Voters</a>`;
        } else {
            adminLinks.innerHTML = "";
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
            const deleteCell = row.insertCell();
            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = "Delete";
            deleteButton.style.backgroundColor = "#ff4d4f";
            deleteButton.style.color = "white";
            deleteButton.style.border = "none";
            deleteButton.style.padding = "6px 12px";
            deleteButton.style.borderRadius = "6px";
            deleteButton.style.cursor = "pointer";
            deleteButton.onclick = () => deleteCandidate(i);
            deleteCell.appendChild(deleteButton);
        });
        p3.innerHTML = "Candidate list updated.";
    } catch (err) {
        console.error("Error:", err);
        p3.innerHTML = "Failed to fetch candidates.";
    }
};

async function addCandidate() {
    const candidateName = document.getElementById("candidateName").value.trim();
    if (!candidateName) {
        Swal.fire("Empty Field", "Please enter a candidate name.", "warning");
        return;
    }
    if (!isWalletConnected()) return;
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contract.addCandidate(candidateName);
        await tx.wait();
        Swal.fire("Success", "Candidate added successfully.", "success");
        getAllCandidates();
    } catch (error) {
        console.error("Error adding candidate:", error);
        Swal.fire("Error", "Failed to add candidate. Are you the admin?", "error");
    }
}

const deleteCandidate = async (index) => {
    if (!isWalletConnected()) return;
    const confirmed = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this candidate?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        cancelButtonText: "No, cancel"
    });
    if (!confirmed.isConfirmed) return;
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contract.deleteCandidate(index);
        await tx.wait();
        Swal.fire("Deleted", "Candidate deleted successfully.", "success");
        getAllCandidates();
    } catch (err) {
        console.error("Delete Candidate Error:", err);
        Swal.fire("Error", "Failed to delete candidate. You are not Admin!!!", "error");
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

// ✅ Auto-connect MetaMask on load
window.onload = async () => {
    if (typeof window.ethereum !== "undefined") {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });

            if (accounts.length > 0) {
                WALLET_CONNECTED = accounts[0];
                document.getElementById("metamasknotification").innerText = `Connected: ${WALLET_CONNECTED}`;
                await checkAdmin();
                await voteStatus();
                await getAllCandidates();
            } else {
                Swal.fire("MetaMask Not Connected", "Please connect MetaMask to continue.", "warning");
            }
        } catch (err) {
            console.error("Auto-connect failed:", err);
        }
    } else {
        Swal.fire("MetaMask Not Found", "Please install MetaMask to use the dApp.", "error");
    }
};
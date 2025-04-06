const hre = require("hardhat");

async function main() {
     const Voting = await hre.ethers.getContractFactory("Voting");
     const Voting_ = await Voting.deploy(50);

     await Voting_.deployed();
     
     console.log(
        `Contract address : ${Voting_.address}`
     );
}

    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });

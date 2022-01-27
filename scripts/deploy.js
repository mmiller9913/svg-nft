// npx hardhat run scripts/deploy.js --network rinkeby

async function main() {
    console.log('Starting the deploy process');

    // Get contract that we want to deploy
    const contractFactory = await hre.ethers.getContractFactory("RandomSVG");

    // Deploy contract with the correct constructor arguments
    const randomSVG = await contractFactory.deploy();

    // Wait for this transaction to be mined
    await randomSVG.deployed();

    // Get contract address
    console.log("Contract deployed to:", randomSVG.address);

    // console.log('Minting 1st NFT')
    // let creation_txn = await randomSVG.create();
    // await creation_txn.wait();

    // console.log('Minting 2nd NFT')
    // creation_txn = await randomSVG.create();
    // await creation_txn.wait();

    // console.log('Minting 3rd NFT')
    // creation_txn = await randomSVG.create();
    // await creation_txn.wait();

    creation_txn = await randomSVG.mintNFTs(5);
    await creation_txn.wait();


}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


//where we're at
//this works when running  npx hardhat run scripts/deploy.js
//why aren't consoles in sol file outputting? -- b/c hardhat config had rinkeby as default network 
//need to get to work on rinkeby -- sort of working, but seems to be a bug where no lines are being drawn sometimes
let { networkConfig } = require('../helper-hardhat-config')

//note: gas limits are in wei

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId
}) => {
    const { deploy, get, log } = deployments;
    const { deployer } = await getNamedAccounts(); //getNamedAccounts looks in hardhat.config for named accounts 
    const chainId = await getChainId();

    //deploy Random SVG contract
    log('Starting deploy process');
    const RandomSVG = await deploy("RandomSVG", {
        from: deployer,
        log: true,
    })
    log(`Deployed the RandomSVG NFT contract to ${RandomSVG.address}`)

    //etherscan verification
    const networkName = networkConfig[chainId]['name'];
    log(`Verify this contract on ethercan with: \n npx hardhat verify --network ${networkName} ${RandomSVG.address}`)

    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];

    //create an NFT by calling a random number 
    const RandomSVGContract = await hre.ethers.getContractFactory('RandomSVG'); //THINK need to do this to get the abi
    const randomSVG = new ethers.Contract(RandomSVG.address, RandomSVGContract.interface, signer);
    // let creation_txn = await randomSVG.create({ gasLimit: 300000 });
    // let receipt = await creation_txn.wait();
    // let tokenId = receipt.events[1].topics[2];
    // let randomNumber = receipt.events[1].topics[3];

    // log('Time to finish the mint...');
    // let finish_tx = await randomSVG.finishMint(tokenId, randomNumber, { gasLimit: 2000000 });
    // await finish_tx.wait(1);
    // log(`You can view the tokenURI here: ${await randomSVG.tokenURI(tokenId)}`);

    let creation_txn = await randomSVG.create({ gasLimit: 300000 });
    let receipt = await creation_txn.wait();
    let tokenId = receipt.events[1].topics[2];
    let randomNumber = receipt.events[1].topics[3];

    log('Time to finish the mint...');
    let finish_tx = await randomSVG.finishMint(tokenId, randomNumber, { gasLimit: 2000000 });
    await finish_tx.wait(1);
    log(`You can view the tokenURI here: ${await randomSVG.tokenURI(tokenId)}`);

}

//the below makes it so, when running something like "npx hardhat deploy --tags rsvg", only files that have this export tag are run
module.exports.tags = ['all', 'rsvg']

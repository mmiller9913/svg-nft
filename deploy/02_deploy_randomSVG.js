const assert = require('assert');
let { networkConfig } = require('../helper-hardhat-config')

//note: gas limits are in wei
module.exports = async({
    getNamedAccounts,
    deployments,
    getChainId
}) => {
    const { deploy, get, log } = deployments;
    const { deployer } = await getNamedAccounts(); //getNamedAccounts looks in hardhat.config for named accounts 
    const chainId = await getChainId();

    let linkTokenAddress, vrfCoordinatorAddress;

    //b/c of what needs to go in constructor...
    //need a link token
    //when deploying locally, we "mock" a fake link token contract & VRF coordinator contract 
    //see 00_deploy_mocks.js
    if (chainId == 31337) {
        //means we're on a local chain
        //this is where "get" comes in - get the linkToken we deployed 
        let linkToken = await get('LinkToken');
        linkTokenAddress = linkToken.address;
        let vrfCoordinatorMock = await get('VRFCoordinatorMock');
        vrfCoordinatorAddress = vrfCoordinatorMock.address;
    } else {
        //if not on local chain (i.e, using Rinkeby), need the linkTokenAddress & vrfCoordinatorAddress
        //get from here: https://docs.chain.link/docs/vrf-contracts/ 
        linkTokenAddress = networkConfig[chainId]['linkToken'];
        vrfCoordinatorAddress = networkConfig[chainId]['vrfCoordinator'];
    }
    const keyHash = networkConfig[chainId]['keyHash'];
    const fee = networkConfig[chainId]['fee'];
    args = [vrfCoordinatorAddress, linkTokenAddress, keyHash, fee];

    //deploy Random SVG contract
    log('Starting deploy process');
    const RandomSVG = await deploy("RandomSVG", {
        from: deployer,
        args: args,
        log: true,
    })
    log(`Deployed the RandomSVG NFT contract to ${RandomSVG.address}`)

    //etherscan verification
    const networkName = networkConfig[chainId]['name'];
    log(`Verify this contract on ethercan with: \n npx hardhat verify --network ${networkName} ${RandomSVG.address} ${args.toString().replace(/,/g, " ")}`)

    //to use the chainlink VRF, need to fund the contract with LINK
    //make sure you have test LINK in wallet address 
    const linkTokenContract = await hre.ethers.getContractFactory('LinkToken');
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];
    const linkToken = new ethers.Contract(linkTokenAddress, linkTokenContract.interface, signer);
    let fund_txn = await linkToken.transfer(RandomSVG.address, fee);
    await fund_txn.wait(); //wait for 1 block

    //create an NFT by calling a random number 
    const RandomSVGContract = await hre.ethers.getContractFactory('RandomSVG'); //THINK need to do this to get the abi
    const randomSVG = new ethers.Contract(RandomSVG.address, RandomSVGContract.interface, signer);
    let creation_txn = await randomSVG.create({ gasLimit: 300000 });
    let receipt = await creation_txn.wait();
    //from the receipt's indexed events, we can get the tokenId 
    // console.log(receipt.events);
    let tokenId = receipt.events[3].topics[2]; //events[3] b/c chainlink VRF also emits events under the hood
    let requestId = receipt.events[3].topics[1];
    log(`You made your NFT! This is token number ${tokenId.toString()}`);
    log(`Let's wait for the Chainlink node to respond...`)
    if(chainId != 31337) { //not on local chain
        const waitTime = 180000; //ms to wait
        await new Promise(r => setTimeout(r, waitTime)); 
        log('Time to finish the mint...');
        let finish_tx = await randomSVG.finishMint(tokenId, { gasLimit: 2000000 });
        await finish_tx.wait(1);
        log(`You can view the tokenURI here: ${await randomSVG.tokenURI(tokenId)}`);

        //TRYING THIS...
        // const finishMint = async() => {
        //     log('Time to finish the mint...');
        //     let finish_tx = await randomSVG.finishMint(tokenId, { gasLimit: 2000000 });
        //     await finish_tx.wait(1);
        //     log(`You can view the tokenURI here: ${await randomSVG.tokenURI(tokenId)}`);
        // }
        // randomSVG.on('CreatedUnfinishedSVG', finishMint);
    } else { //on local chain -- basically pretend to be the chainlink node 
        const VRFCoordinatorMock = await deployments.get('VRFCoordinatorMock');
        vrfCoordinator = await hre.ethers.getContractAt('VRFCoordinatorMock', VRFCoordinatorMock.address, signer);
        //callBackWithRandomness comes from: https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.6/tests/VRFCoordinatorMock.sol 
        //passing the requestId & 7777 (a totally random number) then pass it back to the address of our contract
        let vrf_tx = await vrfCoordinator.callBackWithRandomness(requestId, 77777, randomSVG.address);
        await vrf_tx.wait(1);
        //at this point, fulfillRandomness function in our contract would have been completed
        //ready to call finishMint()
        log('Time to finish the mint...');
        let finish_tx = await randomSVG.finishMint(tokenId, { gasLimit: 2000000 });
        await finish_tx.wait(1);
        log(`You can view the tokenURI here: ${await randomSVG.tokenURI(tokenId)}`);
    }

}

//the below makes it so, when running something like "npx hardhat deploy --tags rsvg", only files that have this export tag are run
module.exports.tags = ['all', 'rsvg']

//npm install hardhat-deploy 
//with this, "npx hardhat deploy" runs through everything in deploy folder 
//must add require('hardhat-deploy') at the top of hardhat-config file

//what we're doing here is similar to the run.js script I made in other projects 

//npx hardhat deploy
// -- deploys to local test blockchain (similar to running npx hardhat run scripts/deploy.js --network localhost, see wavePortal project)
//npx hardhat deploy --network rinkeby
//  -- deploys to rinkeby
    

const { ethers } = require('ethers');
const fs = require('fs');
let { networkConfig } = require('../helper-hardhat-config')

module.exports = async({
    getNamedAccounts,
    deployments,
    getChainId
}) => {
    const { deploy, log } = deployments;

    //getNamedAccounts looks in hardhat.config for named accounts 
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();

    log('----------------------------------'); //basically console.log() in the terminal

    //deploy looks in contracts folder for SVGNFT (the name of the contract, not the file name)
    const SVGNFT = await deploy("SVGNFT", {
        from: deployer,
        log: true,
    })

    log(`You have deployed an NFT contract to ${SVGNFT.address}`)

    let filePath = './img/triangle.svg'
    let svg = fs.readFileSync(filePath, {encoding: "utf8"});

    const SVGNFTContract = await hre.ethers.getContractFactory('SVGNFT'); //THINK need to do this to get the abi
    //NOTE: can also do the below if require('@nomiclabs/hardhat-ethers') is at the top of hardhat.config
    // const SVGNFTContract = await ethers.getContractFactory('SVGNFT'); 
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];
    const svgNFT = new ethers.Contract(SVGNFT.address, SVGNFTContract.interface, signer);
    const networkName = networkConfig[chainId]['name'];

    //this is for verifying on etherscan
    //in case you want to easily copy/past
    log(`Verify this contract on ethercan with: \n npx hardhat verify --network ${networkName} ${svgNFT.address}`)

    let transactionResponse = await svgNFT.create(svg);
    let receipt = await transactionResponse.wait();
    log('you minted an NFT');
    //note - can get tokenURI of any minted NFT on the frontend with this 
    log(`View the tokenURI here: ${await svgNFT.tokenURI(0)}`);
}

//the below makes it so, when running something like "npx hardhat deploy --tags svg", only files that have this export tag are run
module.exports.tags = ['all', 'svg']
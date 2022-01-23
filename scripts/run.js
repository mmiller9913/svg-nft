// npx hardhat run scripts/run.js
//for testing

const fs = require('fs');

const main = async () => {
  const svgNFTContractFactory = await hre.ethers.getContractFactory('SVGNFT');
  const svgNFTContract = await svgNFTContractFactory.deploy();
  await svgNFTContract.deployed();
  console.log("Contract deployed to:", svgNFTContract.address);

  let filePath = './img/triangle.svg'
  let svg = fs.readFileSync(filePath, { encoding: "utf8" });

  // let txn = await svgNFTContract.create(svg);
  // await txn.wait();
  //note - can get tokenURI of any minted NFT on the frontend with this 
  // console.log(`NFT minted, view the tokenURI here: ${await svgNFTContract.tokenURI(0)}`);
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();


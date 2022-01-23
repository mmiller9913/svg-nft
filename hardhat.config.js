require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config({ path: '.env' });
// require('@nomiclabs/hardhat-ethers') //see line 42 in 01_deploy_svg.js for note on this 


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    rinkeby: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.PRIVATE_KEY],
      saveDeployments: true,
    },
  },
  //commented out and added below after we set up the mocks
  // solidity: "0.8.0",
  solidity: {
    compilers: [
      {version: "0.8.0"}, {version: "0.4.24"}, {version: "0.6.6"}, {version: "0.7.0"}
    ]
  },
  namedAccounts: {
    deployer: 0, //account 0 when deploying
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API
  }
};

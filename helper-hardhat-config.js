const networkConfig = {
    31337: {
        name: 'localhost',
        //if not on local chain, need keyHash, & Fee
        //get from here: https://docs.chain.link/docs/vrf-contracts/ 
        //don't need linkToken & vrfCoordinator address b/c these were depployed in mocks 
        keyHash: '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311',
        fee: '100000000000000000' //0.1 LINK to WEI/JUELS
    },
    4: {
        name: 'rinkeby',
        //if not on local chain (i.e, using Rinkeby), need linkTokenAddress. vrfCoordinatorAddress, keyHash, & Fee
        //get from here: https://docs.chain.link/docs/vrf-contracts/ 
        linkToken: '0x01BE23585060835E02B77ef475b0Cc51aA1e0709',
        vrfCoordinator: '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B',
        keyHash: '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311',
        fee: '100000000000000000' //0.1 LINK to WEI/JUELS
    }
}

module.exports = {
    networkConfig
}
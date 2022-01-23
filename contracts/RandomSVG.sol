//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

//get a random number using chainlink VRF: https://docs.chain.link/docs/get-a-random-number/
//make sure you run: npm install @chainlink/contracts 
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

//for base64 encoding 
import "base64-sol/base64.sol";

contract RandomSVG is ERC721URIStorage, VRFConsumerBase {
    bytes32 public keyHash;
    uint256 public fee;
    uint256 public tokenCounter;
    // uint256 public price;
    // address payable public owner;

    //svg params
    uint256 public maxNumberOfPaths;
    uint256 public maxNumberOfPathCommands;
    uint256 public size;
    string[] public pathCommands;
    string[] public colors;

    mapping(bytes32 => address) public requestIdToSender;
    mapping(bytes32 => uint256) public requestIdToTokenId;
    mapping(uint256 => uint256) public tokenIdToRandomNumber;

    event requestedRandomSVG(bytes32 indexed requestId, uint256 indexed tokenId);
    event CreatedUnfinishedSVG(uint256 indexed tokenId, uint256 randomNumber);
    event CreatedRandomSVG(uint256 indexed tokenId, string tokenURI);

    constructor(
        address _VRFCoordinator,
        address _LinkToken,
        bytes32 _keyHash,
        uint256 _fee
    )
        VRFConsumerBase(_VRFCoordinator, _LinkToken)
        ERC721("RandomSVG", "rsNFT")
    {
        //for random number via chainlink VRF
        fee = _fee;
        keyHash = _keyHash;
        tokenCounter = 0;
        // price = 10000000000000000; //0.01 ETH / MATIC / AVAX
        // owner = payable(msg.sender);

        //svg params
        maxNumberOfPaths = 10;
        maxNumberOfPathCommands = 5;
        size = 500;
        pathCommands = ["M", "L"];
        colors = ["red", "blue", "green", "yellow", "black", "white"];
    }

    function create() public returns (bytes32 requestId) {
        //making these NFTs cost $$$
        //make sure function is payable
        // require(msg.value >= price, "Need to send more ETH");

        //get a random number using chainlink VRF: https://docs.chain.link/docs/get-a-random-number/
        //by returning requestId in function arg, same as initializing requestId variable
        //requestRandomness is part of VRFConsumerBase contract -- makes initial request for random number
        //our contract needs to be funded with link to call this function
        requestId = requestRandomness(keyHash, fee);
        requestIdToSender[requestId] = msg.sender; //mapping
        uint256 tokenId = tokenCounter;
        requestIdToTokenId[requestId] = tokenId; //mapping
        tokenCounter = tokenCounter + 1;
        emit requestedRandomSVG(requestId, tokenId);
        
        //still need to...
        //use that random number to generate SVG code
        //base64 encode the SVG code
        //get the tokenURI and mint the nft
    }

    //function to withdraw eth from contract
    //not needed since not setting price for these nfts
    // modifier onlyOwner() {
    //     require(msg.sender == owner, "You are not the owner of this contract");
    //     _;
    // }
    // function withdraw() public payable onlyOwner {
    //     owner.transfer(address(this).balance);
    // }

    //internal b/c only VRF coordinator is calling it
    //get random number back with this function after requesting it w/ requestRandomness() ???
    //AKA random number is returned to this function
    function fulfillRandomness(bytes32 requestId, uint256 randomNumber)
        internal
        override
    {
        address nftOwner = requestIdToSender[requestId];
        uint256 tokenId = requestIdToTokenId[requestId];
        _safeMint(nftOwner, tokenId);
        tokenIdToRandomNumber[tokenId] = randomNumber; //mapping
        emit CreatedUnfinishedSVG(tokenId, randomNumber);
    }

    //finishing minting a specific tokenId
    function finishMint(uint256 _tokenId) public {
        //check to see if it's been minted and a random number is returned
        require(
            bytes(tokenURI(_tokenId)).length <= 0,
            "The tokenURI is already all set for this tokenId"
        );
        require(
            tokenCounter > _tokenId, 
            "the tokenId has not been minted yet"
        );
        require(
            tokenIdToRandomNumber[_tokenId] > 0,
            "You need to wait for the Chainljink VRF to generate a random number"
        );

        //generate random svg code
        uint256 randomNumber = tokenIdToRandomNumber[_tokenId];
        string memory svg = generateSVG(randomNumber);

        //turn it into image URI
        string memory imageURI = svgToImageURI(svg);

        //use image URI to format into a token URI
        string memory tokenUri = formatTokenURI(imageURI);
        _setTokenURI(_tokenId, tokenUri);
        emit CreatedRandomSVG(_tokenId, tokenUri);
    }

    //see desiredSVG.svg for what the final svg should look like 
    function generateSVG(uint256 _randomNumber)
        public
        view
        returns (string memory finalSVG)
    {
        uint256 numberOfPaths = (_randomNumber % maxNumberOfPaths) + 1; //+1 so there's always at least 1 path
        finalSVG = string(
            abi.encodePacked(
                "<svg xmlns='http://www.w3.org/2000/svg' height='",
                uint2str(size),
                "' width='",
                uint2str(size),
                "'>"
            )
        );
        for (uint256 i = 0; i < numberOfPaths; i++) {
            //use a different number for each path
            //basically getting a random number from the random number
            //couldn't do this for the original random number b/c it's not secure
            uint256 newRNG = uint256(
                keccak256(abi.encodePacked(_randomNumber, i))
            );
            string memory pathSVG = generatePath(newRNG);
            finalSVG = string(abi.encodePacked(finalSVG, pathSVG));
        }
        finalSVG = string(abi.encodePacked(finalSVG, '</svg>'));
    }

    function generatePath(uint256 _randomNumber) public view returns (string memory pathSvg) {
        uint256 numberOfPathCommands = (_randomNumber % maxNumberOfPathCommands) + 1; //+1 so there's always at least 1 path;
        pathSvg = "<path stroke-width='4' d='";
        for(uint i; i < numberOfPathCommands; i++) {
            //use a different number for each path command
            //basically getting a random number from the random number
            uint256 newRNG = uint256(
                keccak256(abi.encodePacked(_randomNumber, size + i))
            );
            string memory pathCommand = generatePathCommand(newRNG);
            pathSvg = string(abi.encodePacked(pathSvg, pathCommand));
        }
        string memory color = colors[_randomNumber % colors.length];
        pathSvg = string(abi.encodePacked(pathSvg, "' fill='transparent' stroke='", color, "'/>"));
    }

    function generatePathCommand(uint256 _randomNumber) public view returns (string memory pathCommand) {
        pathCommand = pathCommands[_randomNumber % pathCommands.length];
        uint256 parameterOne = uint256(
                keccak256(abi.encodePacked(_randomNumber, size * 2))
            ) % size; //modding by the size b/c we don't want parameters to be bigger than the size 
        uint256 parameterTwo = uint256(
                keccak256(abi.encodePacked(_randomNumber, size * 3))
            ) % size; //modding by the size b/c we don't want parameters to be bigger than the size 
        pathCommand = string(abi.encodePacked(pathCommand, uint2str(parameterOne), " ", uint2str(parameterTwo), " "));
    }

    //function for converting uint256 => string
    //needed for size variable in svg
    //from: https://stackoverflow.com/questions/47129173/how-to-convert-uint-to-string-in-solidity/65707309#65707309
    function uint2str(uint256 _i)
        internal
        pure
        returns (string memory _uintAsString)
    {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function svgToImageURI(string memory _svg)
        public
        pure
        returns (string memory)
    {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(_svg)))
        );
        string memory imageURI = string(
            abi.encodePacked(baseURL, svgBase64Encoded)
        );
        return imageURI;
    }

    function formatTokenURI(string memory _imageURI)
        public
        pure
        returns (string memory)
    {
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "SVG NFT", ',
                        '"description": "An NFT based on SVG!", ',
                        '"attributes": "", ',
                        '"image": "',
                        _imageURI,
                        '"}'
                    )
                )
            )
        );
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        return finalTokenUri;
    }

}

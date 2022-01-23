//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

//for base64 encoding
//make sure you run npm install base64-sol
import "base64-sol/base64.sol";

//this lets us console.log in our contract
import "hardhat/console.sol";

contract RandomSVG is ERC721URIStorage {
    uint256 public tokenCounter;

    //svg params
    uint256 public maxNumberOfPaths;
    uint256 public maxNumberOfPathCommands;
    uint256 public size;
    string[] public pathCommands;
    string[] public colors;

    event NewNFTMinted(address indexed sender, uint256 indexed tokenId, uint256 indexed rand);
    event CreatedRandomSVG(uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("RandomSVG", "rsNFT") {
        tokenCounter = 0;

        //svg params
        maxNumberOfPaths = 10;
        maxNumberOfPathCommands = 5;
        size = 500;
        pathCommands = ["M", "L"];
        colors = ["red", "blue", "green", "yellow", "black", "white"];
    }

    function create() public {
        uint256 tokenId = tokenCounter;
        tokenCounter = tokenCounter + 1;
        _safeMint(msg.sender, tokenId);
        console.log(
            "An NFT w/ ID %s has been minted to %s",
            tokenId,
            msg.sender
        );
        uint256 randomNumber = random(
            string(abi.encodePacked(block.difficulty, block.timestamp, Strings.toString(tokenId)))
        );
        emit NewNFTMinted(msg.sender, tokenId, randomNumber);
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }
    

    //finishing minting a specific tokenId
    function finishMint(uint256 _tokenId, uint256 _randomNumber) public {
        //check to see if it's been minted and a random number is returned
        require(
            bytes(tokenURI(_tokenId)).length <= 0,
            "The tokenURI is already all set for this tokenId"
        );
        require(tokenCounter > _tokenId, "the tokenId has not been minted yet");

        //generate random svg code
        string memory svg = generateSVG(_randomNumber);

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
        finalSVG = string(abi.encodePacked(finalSVG, "</svg>"));
    }

    function generatePath(uint256 _randomNumber)
        public
        view
        returns (string memory pathSvg)
    {
        uint256 numberOfPathCommands = (_randomNumber %
            maxNumberOfPathCommands) + 1; //+1 so there's always at least 1 path;
        pathSvg = "<path stroke-width='8' d='";
        for (uint256 i; i < numberOfPathCommands; i++) {
            //use a different number for each path command
            //basically getting a random number from the random number
            uint256 newRNG = uint256(
                keccak256(abi.encodePacked(_randomNumber, size + i))
            );
            string memory pathCommand = generatePathCommand(newRNG);
            pathSvg = string(abi.encodePacked(pathSvg, pathCommand));
        }
        string memory color = colors[_randomNumber % colors.length];
        pathSvg = string(
            abi.encodePacked(
                pathSvg,
                "' fill='transparent' stroke='",
                color,
                "'/>"
            )
        );
    }

    function generatePathCommand(uint256 _randomNumber)
        public
        view
        returns (string memory pathCommand)
    {
        pathCommand = pathCommands[_randomNumber % pathCommands.length];
        uint256 parameterOne = uint256(
            keccak256(abi.encodePacked(_randomNumber, size * 2))
        ) % size; //modding by the size b/c we don't want parameters to be bigger than the size
        uint256 parameterTwo = uint256(
            keccak256(abi.encodePacked(_randomNumber, size * 3))
        ) % size; //modding by the size b/c we don't want parameters to be bigger than the size
        pathCommand = string(
            abi.encodePacked(
                pathCommand,
                uint2str(parameterOne),
                " ",
                uint2str(parameterTwo),
                " "
            )
        );
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

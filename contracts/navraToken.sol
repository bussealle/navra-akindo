// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";


contract navraToken is ERC2771Context, ERC1155, ERC1155Supply, ERC1155Burnable, Ownable {  

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIdCounter;
  bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";//use for converting token ID
  address public immutable trustedForwarder;//Biconomy required to explicit

  //Fungible Token represent contributions
  //--> UNLIMITED / UNBURNABLE / TRANSFERREBLE
  uint256 public constant NAVRA_NVR = 0; 

  //Fungible Token pooled each areas
  //--> LIMITED / UNBURNABLE / NON-TRANSFERREBLE
  uint256 public constant NAVRA_NCT = 1; 

  //Fungible Token used for onbording only
  //--> UNLIMITED / BURNABLE / NON-TRANSFERREBLE
  uint256 public constant NAVRA_TNVR = 2;

  //Non Fungible Tokens
  //--> UNIQUE / BURNABLE / Soulbound
  uint256 public constant NAVRA_NFT = 3; //3~

  string baseMetadataURIPrefix;
  string baseMetadataURISuffix;
  uint256 initialTNVR;
  

  constructor(address _trustedForwarder)
    ERC1155("")
    ERC2771Context(_trustedForwarder) {
        baseMetadataURIPrefix = "https://navra.fish/metadata-api/token/";
        baseMetadataURISuffix = ".json";
        initialTNVR = 100;
        trustedForwarder = _trustedForwarder;

        //NVR has upper limit = 10billion
        _mint(msg.sender, NAVRA_NVR, 10**9,""); 
        //tokenId 0 & 1 & 2 are reserved for NVR & NCT & tNVR
        _tokenIdCounter.increment();
        _tokenIdCounter.increment();
        _tokenIdCounter.increment();
  }


    /// @notice Overrides _msgSender() function from Context.sol
    /// @return address The current execution context's sender address
    function _msgSender() 
        internal
        view
        override(Context, ERC2771Context)
        returns (address)
        {
            return ERC2771Context._msgSender();
        }

    /// @notice Overrides _msgData() function from Context.sol
    /// @return address The current execution context's data
    function _msgData()
        internal
        view
        override(Context, ERC2771Context)
        returns (bytes calldata)
        {
            return ERC2771Context._msgData();
        }

    /// @notice Transferes NVR from contract-owner to user and mint NCT to area
    function genDualToken(address _to_area, address _to_user, uint256 _amount)
        public
        onlyOwner
        {
            //mint certain amount of NCT for the Area
            _mint(_to_area, NAVRA_NCT, _amount, "");
            //transfer same amount of NVR from contract to user 
            _safeTransferFrom(owner(), _to_user, NAVRA_NVR, _amount, "");
        }
    
    /// @notice Mints certain amount of TNVR(initial onbording token which is burnable) to user
    function mintTNVR(address _to_user)
        public
        onlyOwner
        {
            //mint tNVR for initial onbording
            _mint(_to_user, NAVRA_TNVR, initialTNVR, "");
        }

    /// @notice Mints new NFT to user
    function mint(address _to_user)
        public
        onlyOwner
        {
            //mint record NFT
            _mint(_to_user, _tokenIdCounter.current(), 1, "");
            _tokenIdCounter.increment();
        }
    
    /// @notice Sets metadata URI prefix/suffix
    function setURI(string memory _prefix, string memory _suffix)
        public
        onlyOwner
        {
            baseMetadataURIPrefix = _prefix;
            baseMetadataURISuffix = _suffix;
        }

    /// @notice Sets amount of TNVR for onbording 
    function setTNVR(uint256 _amount)
        public
        onlyOwner
        {
            initialTNVR = _amount;
        }

    /// @notice Overrides safeTransferFrom() for metaTx
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
        ) public virtual override {
            require(
                    from == _msgSender() || isApprovedForAll(from, _msgSender()),
                    "ERC1155: caller is not token owner nor approved"
                );
            if (_msgSender() == owner()) {
                //Contract owner can transfer user NVR if it was approved
                _safeTransferFrom(from, to, id, amount, data);
            }else{
                //NVR are transferred from user to another user 
                _safeTransferFrom(_msgSender(), to, id, amount, data);
            }
        }

    /// @notice Overrides uri() for checking token id existence
    function uri(uint256 id)
        public
        view
        override
        returns (string memory) 
        {
            require(_tokenIdCounter.current() > id, "id: token doesn't exist");
            // "https://~~~" + tokenID + ".json"
            return string(abi.encodePacked(
                baseMetadataURIPrefix,
                toHexString(id,64),
                baseMetadataURISuffix
            ));
        }
    
    /// @notice Overrides setApprovalForAll() for restricting operator
    function setApprovalForAll(
        address operator, 
        bool approved)
        public
        override
        {
            require(owner() == operator, "operator: only the contract owner can be an operator");
            _setApprovalForAll(_msgSender(), operator, approved);
        }

    /// @notice Overrides setApprovalForAll() for restricting operator
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data) 
        override(ERC1155,ERC1155Supply)
        internal 
        {   
            for(uint i=0; i<ids.length; i++){
                if (ids[i] != NAVRA_NVR) {
                    require(from == address(0) || to == address(0), 
                    "This a Soulbound token. It cannot be transferred. It can only be burned by the token owner");
                }
            }
            super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
        }
    
    /// @notice Converts token ID(uint256) to hex(string of 64 characters)
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes memory buffer = new bytes(length + 2);
        bytes memory convert = new bytes(length);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        for (uint256 i = 2; i < length + 2; i++) {
            convert[i-2] = buffer[i];
        }
        return string(convert);
    }
}

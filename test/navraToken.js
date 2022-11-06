const { expect } = require("chai")
const abi = require("ethereumjs-abi")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe("navra contract test", async () => {

	let TOKENID_NVR = 0
	let TOKENID_NCT = 1
	let TOKENID_TNVR = 2
	let TOKENID_NFT = 3
	let TOTALSUPPLY_NVR = 10**9
	let initialTNVR = 300;
	let baseMetadataURIPrefix = "https://navra.fish/metadata-api/token/";
    let baseMetadataURISuffix = ".json";

	async function deployTokenFixture() {
		accounts = await ethers.getSigners()

		const testnetDaiFactory = await ethers.getContractFactory("TestnetDAI")
		testnetDai = await testnetDaiFactory.deploy()
		await testnetDai.deployed()

		const Forwarder = await ethers.getContractFactory("BiconomyForwarder")
		forwarder = await Forwarder.deploy(await accounts[0].getAddress())
		await forwarder.deployed()

		const navraContractFactory = await ethers.getContractFactory("navraToken")
		navraContract = await navraContractFactory.deploy(forwarder.address)
		await navraContract.deployed()
	
		// for Fixture
		return { accounts, navraContract, forwarder, testnetDai }
	  }

	before("before test", async () => {
		await loadFixture(deployTokenFixture)
	})

	describe("Deployment", function () {
		
		//owner権限は適切か
		it("Should set the right owner", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture)
		  	const owner = accounts[0]
		  	expect(await navraContract.owner()).to.equal(owner.address)
		});
		
		//NVRのトータル発行量はownerの残高と一致するか
		it("Should assign the total supply of NVR to the owner", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture)
			const owner = accounts[0]
		  	const ownerBalance = await navraContract.balanceOf(owner.address,TOKENID_NVR)
		  	expect(await navraContract.totalSupply(TOKENID_NVR)).to.equal(ownerBalance)
		});

		//NVRのトータル発行量は規定量(１０億)か
		it("Should the total supply of NVR to the owner", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture)
			const owner = accounts[0]
		  	expect(await navraContract.balanceOf(owner.address,TOKENID_NVR)).to.equal(TOTALSUPPLY_NVR)
		})

	  })

	describe("Transactions", function () {

		// genDualToken()のテスト
		it("Should work genDualToken()", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture)
			const [owner, addr1, addr2] = accounts
			//addr1へNCTが500mint,addr2へNVRが500transfer
			await navraContract.genDualToken(addr1.address, addr2.address, 500)
			//addr1のNCT残高は500か
			expect(await navraContract.balanceOf(addr1.address,TOKENID_NCT)).to.equal(500)
			//addr2のNVR残高は500か
			expect(await navraContract.balanceOf(addr2.address,TOKENID_NVR)).to.equal(500)
			//ownerのNVR残高は500か
			expect(await navraContract.balanceOf(owner.address,TOKENID_NVR)).to.equal(TOTALSUPPLY_NVR-500)
		})

		// mint()のテスト
		it("Should work mint()", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture)
			const [owner, addr1, addr2] = accounts
			await navraContract.mint(addr1.address)
			expect(await navraContract.balanceOf(addr1.address,TOKENID_NFT)).to.equal(1)
			await navraContract.mint(addr1.address)
			expect(await navraContract.balanceOf(addr1.address,TOKENID_NFT+1)).to.equal(1)
		})

		// mintTNVR()のテスト
		it("Should work mintTNVR()", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture)
			const [owner, addr1, addr2] = accounts
			await navraContract.mintTNVR(addr1.address)
			expect(await navraContract.balanceOf(addr1.address,TOKENID_TNVR)).to.equal(100)
			await navraContract.setTNVR(500)
			await navraContract.mintTNVR(addr2.address)
			expect(await navraContract.balanceOf(addr2.address,TOKENID_TNVR)).to.equal(500)
		})

		// uri()のテスト
		it("Should work uri()", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture)
			await expect(
				await navraContract.uri(TOKENID_NVR)
				).to.equal("https://navra.fish/metadata-api/token/0000000000000000000000000000000000000000000000000000000000000000.json")
			await navraContract.setURI("xxx","yyy")
			await expect(
				await navraContract.uri(TOKENID_NVR)
				).to.equal("xxx0000000000000000000000000000000000000000000000000000000000000000yyy")
		})

		// safeTransferFrom()のテスト
		it("Should work userTransferFrom() between addr1 and addr2", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture);
			const [owner, addr1, addr2] = accounts

			//addr2へNCTが500mint,addr1へNVRが500transfer
			await navraContract.genDualToken(addr2.address, addr1.address, 500)
			//addr1からaddr2へ500NVRをtransfer
			await navraContract.connect(addr1).safeTransferFrom(addr1.address,addr2.address,TOKENID_NVR,500,'0x')
			//addr2のNVR残高は500か
			expect(await navraContract.balanceOf(addr2.address,TOKENID_NVR)).to.equal(500)
			//addr1のNVR残高は0か
			expect(await navraContract.balanceOf(addr1.address,TOKENID_NVR)).to.equal(0)
		})

		// Burnのテスト
		it("Should work burn()", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture);
			const [owner, addr1, addr2] = accounts

			await navraContract.genDualToken(addr1.address, addr2.address, 500)
			await navraContract.mint(addr1.address)
			await navraContract.mintTNVR(addr1.address)

			//addr1が自らのNFTをバーン
			expect(await navraContract.balanceOf(addr1.address,TOKENID_NFT)).to.equal(1)
			await navraContract.connect(addr1).burn(addr1.address,TOKENID_NFT,1)
			expect(await navraContract.balanceOf(addr1.address,TOKENID_NFT)).to.equal(0)
		})

		//Approvalのテスト
		it("Should work setApprovalForAll()", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture);
			const [owner, addr1, addr2] = accounts

			await navraContract.mint(addr1.address)
			await navraContract.genDualToken(addr2.address, addr1.address, 500)

			//addr1からownerにtokenの操作を許可
			await navraContract.connect(addr1).setApprovalForAll(owner.address,true)
			//ownerはaddr1のtokenの操作を許可されているか
			await expect(navraContract.connect(addr1).setApprovalForAll(addr2.address,true)
			).to.be.revertedWith("operator: only the contract owner can be an operator")
			//ownerはadress1のtokenの操作を許可されているか
			expect(await navraContract.isApprovedForAll(addr1.address,owner.address)).to.equal(true)
			//adress2はaddr1のtokenの操作を許可されていないか
			expect(await navraContract.isApprovedForAll(addr1.address,addr2.address)).to.equal(false)
			//addr1にNVR(tokenid=0)が存在しているか
			expect(await navraContract.balanceOf(addr1.address,TOKENID_NVR)).to.equal(500)
			//ownerがaddr1のNVRをaddr2に転送
			await navraContract.connect(owner).safeTransferFrom(addr1.address,addr2.address,TOKENID_NVR,100,'0x')
			//転送が成功したか
			expect(await navraContract.balanceOf(addr1.address,TOKENID_NVR)).to.equal(400)
			expect(await navraContract.balanceOf(addr2.address,TOKENID_NVR)).to.equal(100)
		})

		//存在しないtoken IDのテスト
		it("Should fail if tokenID doesn't exist", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture)
			await expect(
				navraContract.uri(TOKENID_NFT)
			).to.be.revertedWith("id: token doesn't exist")
		})
		
		//Ownableのテスト
		it("Should fail if onlyOwner functions excused by NOT-owner", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture)
			const [owner, addr1, addr2] = accounts
			await expect(
				navraContract.connect(addr1).genDualToken(addr1.address,addr2.address,500)
			).to.be.revertedWith("Ownable: caller is not the owner")
			await expect(
				navraContract.connect(addr1).mint(addr1.address)
			).to.be.revertedWith("Ownable: caller is not the owner")
			await expect(
				navraContract.connect(addr1).mintTNVR(addr1.address)
			).to.be.revertedWith("Ownable: caller is not the owner")
			await expect(
				navraContract.connect(addr1).setURI("xxx","yyy")
			).to.be.revertedWith("Ownable: caller is not the owner")
			await expect(
				navraContract.connect(addr1).setTNVR(500)
			).to.be.revertedWith("Ownable: caller is not the owner")
		})

		// Soulboundのテスト(NVR以外のトークンは全て譲渡不可)
		it("Should fail if soulbound tokens (except NVR) are transferred", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture);
			const [owner, addr1, addr2] = accounts

			await navraContract.genDualToken(addr1.address, addr2.address, 500)
			await navraContract.mint(addr1.address)
			await navraContract.mintTNVR(addr1.address)

			//addr1からaddr2へ500NCTをtransfer
			await expect(
				navraContract.connect(addr1).safeTransferFrom(addr1.address,addr2.address,TOKENID_NCT,500,'0x')
			).to.be.revertedWith('This a Soulbound token. It cannot be transferred. It can only be burned by the token owner')
			//addr1からaddr2へNFTをtransfer
			await expect(
				navraContract.connect(addr1).safeTransferFrom(addr1.address,addr2.address,TOKENID_NFT,1,'0x')
			).to.be.revertedWith('This a Soulbound token. It cannot be transferred. It can only be burned by the token owner')
			//addr1からaddr2へtNVRをtransfer
			await expect(
				navraContract.connect(addr1).safeTransferFrom(addr1.address,addr2.address,TOKENID_TNVR,300,'0x')
			).to.be.revertedWith('This a Soulbound token. It cannot be transferred. It can only be burned by the token owner')
			//addr1のもつNFTをaddr2がバーン
			await expect(
				navraContract.connect(addr2).burn(addr1.address,TOKENID_NFT,1)
			).to.be.revertedWith('ERC1155: caller is not token owner nor approved')
		})

		
	})
	
	describe("Meta-Transactions", function () {
		// 仮想Forwarderのオフラインテスト
		it("Should signed messages pass through the forwarder", async function () {
			const { accounts, navraContract, forwarder, testnetDai} = await loadFixture(deployTokenFixture);
			const [owner, addr1, addr2] = accounts

			//addr2へNCTが500mint,addr1へNVRが500transfer
			await navraContract.genDualToken(addr2.address, addr1.address, 500)
			//addr1からaddr1へ500NVRをtransfer
			const req = await navraContract.connect(addr1)
				.populateTransaction.safeTransferFrom(addr1.address,addr2.address,TOKENID_NVR,500,'0x')
			//以下Txの作成
			req.from = addr1.address
			req.batchNonce = 0
			req.batchId = 0
			req.txGas = req.gasLimit.toNumber()
			req.tokenGasPrice = 0
			req.deadline = 0
			delete req.gasPrice
			delete req.gasLimit
			delete req.chainId
			req.token = testnetDai.address
			const hashToSign = abi.soliditySHA3(
				[
					"address",
					"address",
					"address",
					"uint256",
					"uint256",
					"uint256",
					"uint256",
					"uint256",
					"bytes32",
				],
				[
					req.from,
					req.to,
					req.token,
					req.txGas,
					req.tokenGasPrice,
					req.batchId,
					req.batchNonce,
					req.deadline,
					ethers.utils.keccak256(req.data),
				]
			)
			const sig = await addr1.signMessage(hashToSign)
			//forwarderのナンス値が0であることの確認
			expect(
				await forwarder.getNonce(await addr1.address, 0)
			).to.equal(0)
			//Txに署名して送付
			const tx = await forwarder.executePersonalSign(req, sig)
			const receipt = await tx.wait((confirmations = 1))
			//console.log(`gas used from receipt ${receipt.gasUsed.toNumber()}`)//gasの確認
			//forwarderを経由してナンス値が増えているか
			expect(
				await forwarder.getNonce(await addr1.address, 0)
			).to.equal(1)
		})
	})
})

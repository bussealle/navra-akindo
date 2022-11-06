const { ethers } = require('hardhat');

const main = async () => {

	// Deploying navraToken Contract
	const navraContractFactory = await ethers.getContractFactory(
		"navraToken"
	)
	const navraContract = await navraContractFactory.deploy(
    //Biconomy Trusted Forwarder Adress on Polygon Testnet Mumbai
    //https://docs.biconomy.io/misc/contract-addresses
		"0x69015912AA33720b842dCD6aC059Ed623F28d9f7"
	)
	await navraContract.deployed()
	console.log(
		"navra contract deployed to:",
		navraContract.address
	)
}

const runMain = async () => {
	try {
		await main()
		process.exit(0)
	} catch (error) {
		console.log(error)
		process.exit(1)
	}
}

runMain()
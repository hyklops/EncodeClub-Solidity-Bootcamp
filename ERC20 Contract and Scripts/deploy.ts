import { ethers } from "ethers";
import { env } from "process";
import "dotenv/config";
import tokenJson from "../artifacts/contracts/ERC20.sol/ChaosToken.json";

async function main() {
  const wallet = new ethers.Wallet("0x" + process.env.PRIVATE_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("ropsten", {
    infura: env.INFURA_ID,
  });
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }
  console.log("Deploying Token contract");

  const tokenFactory = new ethers.ContractFactory(
    tokenJson.abi,
    tokenJson.bytecode,
    signer
  );
  const tokenContract = await tokenFactory.deploy();
  console.log("Awaiting confirmations");
  await tokenContract.deployed();
  console.log("Completed");
  console.log(`Contract deployed at ${tokenContract.address}`);
  const mintTx = await tokenContract.mint(
    wallet.address,
    ethers.utils.parseEther("100")
  );
  await mintTx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

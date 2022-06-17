import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../typechain";
import { env } from "process";

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
  if (process.argv.length < 3) throw new Error("Ballot address missing");
  const ballotAddress = process.argv[2];
  if (process.argv.length < 4) throw new Error("Proposal name missing");
  const proposalNumber = process.argv[3];
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;
  const voterAddress = wallet.address;
  console.log(
    `Giving vote from address ${voterAddress} to this Proposal ${proposalNumber}`
  );
  const tx = await ballotContract.vote(proposalNumber);
  console.log("Awaiting confirmations");
  await tx.wait();
  console.log(`Transaction completed. Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../artifacts/contracts/Ballot.sol/Ballot.json";
import { env } from "process";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function attach() {
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
  console.log("attaching Ballot contract");
  console.log("Proposals: ");
  const proposals = PROPOSALS;
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });

  const ballotContract = new ethers.Contract(
    "0xb8fF99d3c3AfA0CF58e5819473236cb3a926889D",
    ballotJson.abi,
    signer
  );
  console.log("Completed");
  console.log(`Contract attached at ${ballotContract.address}`);
  return { ballotContract, provider, signer };
}

function setListeners(
  ballotContract: ethers.Contract,
  provider: ethers.providers.BaseProvider
) {
  console.log("Setting listeners on");
  const eventFilterNewVoter = ballotContract.filters.NewVoter();
  provider.on(eventFilterNewVoter, (log) => {
    console.log("New voter");
    console.log({ log });
  });
  const eventFilter2 = ballotContract.filters.Voted();
  provider.on(eventFilter2, (log) => {
    console.log("New vote cast");
    console.log({ log });
  });
  const eventFilter3 = ballotContract.filters.Delegeted();
  provider.on(eventFilter3, (log) => {
    console.log("New vote delegation");
    console.log({ log });
  });
}

async function Populate(
  ballotContract: ethers.Contract,
  provider: ethers.providers.BaseProvider,
  signer: ethers.Signer
) {
  console.log("Populating transactions");
  const wallet1 = ethers.Wallet.createRandom().connect(provider);
  const wallet2 = ethers.Wallet.createRandom().connect(provider);

  let tx;
  console.log(`Giving right to vote to ${wallet1.address}`);
  tx = await ballotContract.giveRightToVote(wallet1.address);
  await tx.wait();
  console.log(`Funding account ${wallet1.address}`);
  tx = await signer.sendTransaction({
    to: wallet1.address,
    value: ethers.utils.parseEther("0.001"),
  });
  await tx.wait();
  console.log("Interacting with contract now:");
  tx = await ballotContract.connect(wallet1).vote(0);
  await tx.wait();
  console.log("Done");
}

async function main() {
  const { ballotContract, provider, signer } = await attach();
  setListeners(ballotContract, provider);
  await Populate(ballotContract, provider, signer);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

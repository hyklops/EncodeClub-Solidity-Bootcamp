import { ethers } from "ethers";
import "dotenv/config";
import { Ballot } from "../typechain";
import { env } from "process";
import BallotArtifact from "../artifacts/contracts/Ballot.sol/Ballot.json";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

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
  console.log("Deploying Ballot contract");

  const ballotFactory = new ethers.ContractFactory(
    BallotArtifact.abi,
    BallotArtifact.bytecode,
    signer
  );
  console.log("Deploying Ballot contract");
  const ballotContract: Ballot = (await ballotFactory.deploy(
    convertStringArrayToBytes32(PROPOSALS)
  )) as Ballot;
  console.log("Awaiting confirmations");
  const deploymentTx = await ballotContract.deployed();
  console.log("Completed");
  console.log({ deploymentTx });
  for (let index = 0; index < PROPOSALS.length; index++) {
    const proposal = await ballotContract.proposals(index);
    console.log(
      `Proposal at ${index} is named ${ethers.utils.parseBytes32String(
        proposal[0]
      )}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

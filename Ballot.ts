describe("when the voter interact with the vote function in the contract", function () {
    it("is has succesfully Voted", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      const tx = await ballotContract.connect(accounts[1]).vote(0);
      const voter = await ballotContract.voters(voterAddress);
      await tx.wait();
      await expect(voter.voted.valueOf()).to.be.eq(true);
    });
  });

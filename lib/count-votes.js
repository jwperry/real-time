const countVotes = (votes) => {
  var voteCount = {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  };

  for (var vote in votes) {
    voteCount[votes[vote]]++
  }

  return voteCount;
}

module.exports = countVotes;

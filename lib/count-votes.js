const countVotes = (votes, pollId, socketId) => {
  var voteCount = {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  };

  for (var vote in votes[pollId]) {
    if (votes[pollId][vote] !== 'resultsOnly') {
      voteCount[votes[pollId][vote]]++
    }
  }

  return voteCount;
}

module.exports = countVotes;

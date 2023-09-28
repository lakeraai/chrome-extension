module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  // this ignores everything from being transformed in node_modules except for the compromise module
  transformIgnorePatterns: ["node_modules/(?!compromise)/"],
}

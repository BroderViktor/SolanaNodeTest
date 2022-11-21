const { getMint } = require("@solana/spl-token");

sol = require("@solana/web3.js");
solToken = require("@solana/spl-token");
bs58 = require("bs58");

const connection = new sol.Connection(sol.clusterApiUrl("devnet"));
const publicKeySol = new sol.PublicKey('EsTCkUkyS4QrXELy62p1Ln39anxWGXbmjaXMdeCBu7Qm');
const publicKeyBac = new sol.PublicKey('FFDyss8ZNKDoptctFbem76j5idS5yqWVc3kLsNhgFSpV');

(async () => {
  let balance = await connection.getBalance(publicKeySol);
  console.log(`${balance / sol.LAMPORTS_PER_SOL} SOL`);

  let BacBalance = await connection.getTokenAccountBalance(publicKeyBac);
  console.log(BacBalance)
})();

// (async () => {

//   const connection = new sol.Connection("https://api.devnet.solana.com");

//   const tokenAccounts = await connection.getTokenAccountsByOwner(
//     new sol.PublicKey('EsTCkUkyS4QrXELy62p1Ln39anxWGXbmjaXMdeCBu7Qm'),
//     {
//       programId: solToken.TOKEN_PROGRAM_ID,
//     }
//   );

//   console.log("Token                                         Balance");
//   console.log("------------------------------------------------------------");
//   tokenAccounts.value.forEach((tokenAccount) => {
//     const accountData = AccountLayout.decode(tokenAccount.account.data);
//     console.log(`${new sol.PublicKey(accountData.mint)}   ${accountData.amount}`);
//   })

// })();
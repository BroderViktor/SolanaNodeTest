const { getMinimumBalanceForRentExemptAccount } = require("@solana/spl-token");

sol = require("@solana/web3.js");
sol_tok = require("@solana/spl-token")
bs58 = require("bs58");

// connection
const connection = new sol.Connection(sol.clusterApiUrl("devnet"));
// Key of the owner of mint
const publicKey = new sol.PublicKey("D9uxpp7Qb2YUJ1TVHy5ocQAR2E8UKYwZcSXriPxzeoAC");


async function CreateTokenMint() {
  const mintKeypair = await new sol.Keypair();
  const lamports = await sol_tok.getMinimumBalanceForRentExemptMint(connection);
  const programid = await sol_tok.TOKEN_PROGRAM_ID;
  console.log("fe")
  const createAccount = sol.SystemProgram.createAccount({publicKey, lamports, mintKeypair.publicKey,
    programid,
    sol_tok.MINT_SIZE,
  })
/*    /** The account that will transfer lamports to the created account 
fromPubkey: PublicKey;
/** Public key of the created account
newAccountPubkey: PublicKey;
/** Amount of lamports to transfer to the created account 
lamports: number;
/** Amount of space in bytes to allocate to the created account
space: number;
 Public key of the program to assign as the owner of the created account
programId: PublicKey;*/

  console.log("fe")
  const transaction = new sol.Transaction().add(
    createAccount,
  );
  /*var signature = await solanaWeb3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [keypair, splaccount]);*/
  return signature;
}

async function GetSolBalance() {
  return connection.getBalance(publicKey);
}
(async () => {
  console.log(await CreateTokenMint());
  //let balance = await connection.getBalance(publicKey);
  //console.log(`${balance / sol.LAMPORTS_PER_SOL} SOL`);
})();




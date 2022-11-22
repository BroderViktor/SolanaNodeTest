import * as web3 from "@solana/web3.js";
import * as solToken from "@solana/spl-token";
import bs58 from "bs58";
// connection
const connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
// Key of the owner of mint
let userKey = web3.Keypair.fromSecretKey(bs58.decode("3ag6LWpm7Mb8rE2gNpkQZKVT4mZwpn3UDKf3RWBUN8W95hR5wkzzExD4mdPatzS6yjzm8v8Qfs2RHjm1aDXBwEPe"));
//Created account 2iQF8j1kpYEA1LxoKnT1ontmvosmxoiR9E9WGuEaYJEZ5Le8wLvVMusiEJSaXKgfwUGYJLzGFgST2rSkGgh6iHSk
//let accountKey = web3.Keypair.fromSecretKey(bs58.decode("2iQF8j1kpYEA1LxoKnT1ontmvosmxoiR9E9WGuEaYJEZ5Le8wLvVMusiEJSaXKgfwUGYJLzGFgST2rSkGgh6iHSk"))

async function AddSolToTestWallet() {
  let airdropSignature = await connection.requestAirdrop(
    userKey.publicKey,
    web3.LAMPORTS_PER_SOL,
  );
  
  await connection.confirmTransaction(airdropSignature);
}


async function CreateTokenMint() {
  const mintKeypair = new web3.Keypair();
  const lamports = await solToken.getMinimumBalanceForRentExemptMint(connection);
  const programid = solToken.TOKEN_PROGRAM_ID;

  // const createAccount = web3.SystemProgram.createAccount({
  //   payer: userKey.publicKey, 
  //   accountPubkey: mintKeypair.publicKey,
  //   lamports: lamports, 
  //   space: solToken.MINT_SIZE,
  //   programId: programid,
  // });
  let allocateInstruction = web3.SystemProgram.allocate({
    accountPubkey: mintKeypair.publicKey,
    space: 100,
  });

  const transaction = new web3.Transaction().add(
    allocateInstruction,
  );

  var signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [userKey, mintKeypair]);

  return signature, mintKeypair;
}

async function GetSolBalance(key) {
  return connection.getBalance(key);
}
(async () => {
  console.log(GetSolBalance(userKey.publicKey));

  //await AddSolToTestWallet();
  //console.log(await CreateTokenMint());
  //let balance = await connection.getBalance(publicKey);
  //console.log(`${balance / LAMPORTS_PER_SOL} SOL`);
})();
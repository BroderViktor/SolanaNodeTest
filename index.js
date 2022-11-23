import * as web3 from "@solana/web3.js";
import * as solToken from "@solana/spl-token";
import bs58 from "bs58";
// connection
const connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
// Key of the owner of mint
let userKey = web3.Keypair.fromSecretKey(bs58.decode("3ag6LWpm7Mb8rE2gNpkQZKVT4mZwpn3UDKf3RWBUN8W95hR5wkzzExD4mdPatzS6yjzm8v8Qfs2RHjm1aDXBwEPe"));


let createdMintKeypair = web3.Keypair.fromSecretKey(Uint8Array.from([
  131, 211, 250, 222, 239, 231, 115, 198, 187,  70,
  154, 206, 235, 131,  75, 185, 130, 119, 218,  69,
  202, 173, 203, 190,  78, 190, 126,  18, 150,  10,
  153, 168,  56, 152, 114, 213,  50, 219, 114,  14,
   85, 183, 176, 204, 229, 125, 191,  29, 230,  60,
  132,  28, 165, 147, 116, 255, 110, 101,  11, 100,
  112,  48, 128, 211
]));
let createdTokenAccountKeypair = web3.Keypair.fromSecretKey(Uint8Array.from([
  71, 107, 178, 130, 146, 151, 173, 121, 142, 242,  66,
  11,  65, 158, 130, 209,  56, 146, 209, 135, 219, 171,
  56, 181, 102, 180, 214,  31, 193, 196,   5, 185, 213,
 222,  32,  88, 231,  71, 202,  38, 149, 254,  79, 100,
 152,  59, 255,  23, 104, 127, 250,  70,  73,  36, 201,
 101, 174, 151,  79, 155,  81, 207, 217, 198
]));

async function AddSolToTestWallet() {
  let airdropSignature = await connection.requestAirdrop(
    userKey.publicKey,
    web3.LAMPORTS_PER_SOL,
  );
  
  await connection.confirmTransaction(airdropSignature);
}

async function CreateTokenMint() {
  let mintKeypair = web3.Keypair.generate();
  let lamports = await solToken.getMinimumBalanceForRentExemptMint(connection);
  let programId = solToken.TOKEN_PROGRAM_ID;

  const createAccount = web3.SystemProgram.createAccount({
    fromPubkey: userKey.publicKey, 
    newAccountPubkey: mintKeypair.publicKey,
    space: solToken.MINT_SIZE,
    lamports, 
    programId,
  });
  const mintInstruction = solToken.createInitializeMintInstruction(mintKeypair.publicKey, 9, userKey.publicKey, userKey.publicKey, programId);

  const transaction = new web3.Transaction().add(
    createAccount,
    mintInstruction,
  );

  var signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [userKey, mintKeypair]);
  console.log("2fefe");
  return mintKeypair;
}

async function CreateTokenAccount(mintKeypair) {
  const mintState = await solToken.getMint(connection, mintKeypair.publicKey)
  const accountKeypair = new web3.Keypair();
  const space = solToken.getAccountLenForMint(mintState);
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  const programid = solToken.TOKEN_PROGRAM_ID;

  const createAccount = web3.SystemProgram.createAccount({
    fromPubkey: userKey.publicKey, 
    newAccountPubkey: accountKeypair.publicKey,
    space: space,
    lamports: lamports, 
    programId: programid,
  });

  const tokenAccountInstruction = solToken.createInitializeAccountInstruction(accountKeypair.publicKey, mintKeypair.publicKey, userKey.publicKey, programid);

  const transaction = new web3.Transaction().add(
    createAccount,
    tokenAccountInstruction,
  );

  var signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [userKey, accountKeypair]);

  return accountKeypair;
}

async function CreateAssociatedTokenAccount(mintKeypair) {
  const associatedTokenAddress = await solToken.getAssociatedTokenAddress(mintKeypair.publicKey, userKey.publicKey, false)

  const associatedTokenAccount = solToken.createAssociatedTokenAccountInstruction(
    userKey.publicKey, associatedTokenAddress, userKey.publicKey, createdMintKeypair.publicKey);

  const transaction = new web3.Transaction().add(associatedTokenAccount);

  var signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [userKey]);

  return associatedTokenAddress;
}

async function CreateToken(amount) {
  const mintTo = solToken.createMintToInstruction(createdMintKeypair.publicKey, createdTokenAccountKeypair.publicKey, userKey.publicKey, amount * 1000000000);

  const transaction = new web3.Transaction().add(mintTo);

  var signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [userKey]);

  return signature;
}

async function TransferToken(amount, source, destination) {
  const mintTo = solToken.createTransferInstruction(source, destination, userKey.publicKey, amount * 1000000000);

  const transaction = new web3.Transaction().add(mintTo);

  var signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [userKey]);

  return signature;
}

async function GetSolBalance(key) {
  return connection.getBalance(key);
}

(async () => {
  console.log(await GetSolBalance(userKey.publicKey));

  //await AddSolToTestWallet();
  //console.log(await CreateTokenMint());
  //let balance = await connection.getBalance(publicKey);
  //console.log(`${balance / LAMPORTS_PER_SOL} SOL`);
  CreateToken(100)
  console.log("Create accounts");
  console.log(userKey.publicKey.toString())
  let sig = await TransferToken(0.5, createdTokenAccountKeypair.publicKey, userKey.publicKey);
  console.log("sig: ", sig);

  //let createdMintKeypair = await CreateTokenMint();
  //console.log("MintKeypair: ", createdMintKeypair);

  //let createdTokenAccountKeypair = await CreateTokenAccount(createdMintKeypair);
  //console.log("TokenAccountKeypair: ", createdTokenAccountKeypair);

  console.log("Program finished");
})();



/*

MintKeypair:  Keypair {
  _keypair: {
    publicKey: Uint8Array(32) [
       56, 152, 114, 213,  50, 219, 114,
       14,  85, 183, 176, 204, 229, 125,
      191,  29, 230,  60, 132,  28, 165,
      147, 116, 255, 110, 101,  11, 100,
      112,  48, 128, 211
    ],
    secretKey: Uint8Array(64) [
      131, 211, 250, 222, 239, 231, 115, 198, 187,  70,
      154, 206, 235, 131,  75, 185, 130, 119, 218,  69,
      202, 173, 203, 190,  78, 190, 126,  18, 150,  10,
      153, 168,  56, 152, 114, 213,  50, 219, 114,  14,
       85, 183, 176, 204, 229, 125, 191,  29, 230,  60,
      132,  28, 165, 147, 116, 255, 110, 101,  11, 100,
      112,  48, 128, 211
    ]
  }
}

TokenAccountKeypair:  Keypair {
  _keypair: {
    publicKey: Uint8Array(32) [
      213, 222,  32,  88, 231,  71, 202,  38,
      149, 254,  79, 100, 152,  59, 255,  23,
      104, 127, 250,  70,  73,  36, 201, 101,
      174, 151,  79, 155,  81, 207, 217, 198
    ],
    secretKey: Uint8Array(64) [
       71, 107, 178, 130, 146, 151, 173, 121, 142, 242,  66,
       11,  65, 158, 130, 209,  56, 146, 209, 135, 219, 171,
       56, 181, 102, 180, 214,  31, 193, 196,   5, 185, 213,
      222,  32,  88, 231,  71, 202,  38, 149, 254,  79, 100,
      152,  59, 255,  23, 104, 127, 250,  70,  73,  36, 201,
      101, 174, 151,  79, 155,  81, 207, 217, 198
    ]
  }
}
 */
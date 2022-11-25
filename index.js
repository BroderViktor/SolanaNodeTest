import * as web3 from "@solana/web3.js";
import * as solToken from "@solana/spl-token";
import bs58 from "bs58";
import express from "express";


const PORT = 3001;
const app = express();

app.get("/balance", async (req, res) => {
  let balance = await GetSolBalance(userKeypair.publicKey);
  res.json({message: balance});
})

app.listen(PORT, async () => {
  let balance = await GetSolBalance(userKeypair.publicKey);
  console.log(`Server listening on ${PORT}`);
  console.log("balance: ", balance)
});

// connection
const connection = new web3.Connection(web3.clusterApiUrl("devnet"), "confirmed");
// Key of the owner of mint
let userKeypair = web3.Keypair.fromSecretKey(bs58.decode("3ag6LWpm7Mb8rE2gNpkQZKVT4mZwpn3UDKf3RWBUN8W95hR5wkzzExD4mdPatzS6yjzm8v8Qfs2RHjm1aDXBwEPe"));
let testUserKeypair = web3.Keypair.fromSecretKey(bs58.decode("43iX4TUfy3GHmsiJTRmKMRsHbVVp5Abuqz3uSscN59Zn152yeEWDRFst8fvEBKT1AGJZ4WjRUawGgEfeh2Bz1Yp9"));

let createdMintKeypair = web3.Keypair.fromSecretKey(Uint8Array.from([
  131, 211, 250, 222, 239, 231, 115, 198, 187,  70,
  154, 206, 235, 131,  75, 185, 130, 119, 218,  69,
  202, 173, 203, 190,  78, 190, 126,  18, 150,  10,
  153, 168,  56, 152, 114, 213,  50, 219, 114,  14,
   85, 183, 176, 204, 229, 125, 191,  29, 230,  60,
  132,  28, 165, 147, 116, 255, 110, 101,  11, 100,
  112,  48, 128, 211
]));

let tokenAccountUser = web3.Keypair.fromSecretKey(Uint8Array.from([
  71, 107, 178, 130, 146, 151, 173, 121, 142, 242,  66,
  11,  65, 158, 130, 209,  56, 146, 209, 135, 219, 171,
  56, 181, 102, 180, 214,  31, 193, 196,   5, 185, 213,
 222,  32,  88, 231,  71, 202,  38, 149, 254,  79, 100,
 152,  59, 255,  23, 104, 127, 250,  70,  73,  36, 201,
 101, 174, 151,  79, 155,  81, 207, 217, 198
]));

let tokenAccountTestUser = web3.Keypair.fromSecretKey(Uint8Array.from([
  124, 139,  33,   8,  23,  24,  23, 224, 254,  45, 182,
  115, 239,  39, 198, 126, 201, 200,  59, 201, 171, 102,
  241, 178, 100, 248, 221,  73,   2, 180,   6, 100, 217,
   37, 249,  51,   4, 110, 248,  86, 129, 129, 158,  33,
  129,  22,  34,  11, 243, 168,   6,  80,  69, 197, 206,
   28,  38,  68, 161, 106,  48, 199, 143,  82
]));

async function AddSolToTestWallet(amount) {
  let airdropSignature = await connection.requestAirdrop(
    userKeypair.publicKey,
    web3.LAMPORTS_PER_SOL * amount,
  );
  
  await connection.confirmTransaction(airdropSignature);
}

async function TransferSol(source, destination, amount) {
  const transfer = web3.SystemProgram.transfer({fromPubkey: destination.publicKey, toPubkey: source.publicKey, lamports: amount * 1000000000});

  const transaction = new web3.Transaction().add(transfer);

  var signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [destination, source]);

  return signature;
}

async function CreateTokenMint() {
  let mintKeypair = web3.Keypair.generate();
  let lamports = await solToken.getMinimumBalanceForRentExemptMint(connection);
  let programId = solToken.TOKEN_PROGRAM_ID;

  const createAccount = web3.SystemProgram.createAccount({
    fromPubkey: userKeypair.publicKey, 
    newAccountPubkey: mintKeypair.publicKey,
    space: solToken.MINT_SIZE,
    lamports, 
    programId,
  });
  const mintInstruction = solToken.createInitializeMintInstruction(mintKeypair.publicKey, 9, userKeypair.publicKey, userKeypair.publicKey, programId);

  const transaction = new web3.Transaction().add(
    createAccount,
    mintInstruction,
  );

  var signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [userKeypair, mintKeypair]);
  console.log("2fefe");
  return mintKeypair;
}

async function AddTokenAccountToUser(user, mintPublicKey) {
  const mintState = await solToken.getMint(connection, mintPublicKey)
  const accountKeypair = new web3.Keypair();
  const space = solToken.getAccountLenForMint(mintState);
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  const programid = solToken.TOKEN_PROGRAM_ID;

  const createAccount = web3.SystemProgram.createAccount({
    fromPubkey: user.publicKey, 
    newAccountPubkey: accountKeypair.publicKey,
    space: space,
    lamports: lamports, 
    programId: programid,
  });

  const tokenAccountInstruction = solToken.createInitializeAccountInstruction(accountKeypair.publicKey, mintPublicKey, user.publicKey, programid);

  const transaction = new web3.Transaction().add(
    createAccount,
    tokenAccountInstruction,
  );

  var signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [user, accountKeypair]);

  return accountKeypair;
}

async function CreateAssociatedTokenAccount(mintKeypair) {
  const associatedTokenAddress = await solToken.getAssociatedTokenAddress(mintKeypair.publicKey, userKeypair.publicKey, false)

  const associatedTokenAccount = solToken.createAssociatedTokenAccountInstruction(
    userKeypair.publicKey, associatedTokenAddress, userKeypair.publicKey, createdMintKeypair.publicKey);

  const transaction = new web3.Transaction().add(associatedTokenAccount);

  var signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [userKeypair]);

  return associatedTokenAddress;
}

async function CreateToken(amount) {
  const mintTo = solToken.createMintToInstruction(createdMintKeypair.publicKey, tokenAccountUser.publicKey, userKeypair.publicKey, amount * 1000000000);

  const transaction = new web3.Transaction().add(mintTo);

  var signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [userKeypair]);

  return signature;
}

async function TransferToken(amount, source, owner, destination) {
  //Hva er source ikke keegt
  const transfer = solToken.createTransferInstruction(source.publicKey, destination.publicKey, owner.publicKey, amount * 1000000000);

  const transaction = new web3.Transaction().add(transfer);

  var signature = await web3.sendAndConfirmTransaction(
    connection, 
    transaction, 
    [owner]);

  return signature;
}

async function GetSolBalance(key) {
  let b = await connection.getBalance(key);
  
  return b / web3.LAMPORTS_PER_SOL;
}


/*
(async () => {
  console.log(await GetSolBalance(userKeypair.publicKey));

  //await AddSolToTestWallet();
  //console.log(await CreateTokenMint());
  //let balance = await connection.getBalance(publicKey);
  //console.log(`${balance / LAMPORTS_PER_SOL} SOL`);
  console.log("Create accounts");
  console.log(tokenAccountTestUser.publicKey.toString());
  console.log(tokenAccountUser.publicKey.toString());
  console.log(userKeypair.publicKey.toString());
  //console.log(await TransferSol(testUserKeypair, userKeypair, 1));
  let sig = await TransferToken(51, tokenAccountUser, userKeypair, tokenAccountTestUser);

  //let createdMintKeypair = await CreateTokenMint();
  //console.log("MintKeypair: ", createdMintKeypair);

  //let tokenAccountKeypair = await AddTokenAccountToUser(testUserKeypair, createdMintKeypair.publicKey);
  
  //console.log("TokenAccountKeypair: ", tokenAccountKeypair);

  console.log("Program finished");
})();*/



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

TestTokenAccountKeypair:  Keypair {
  _keypair: {
    publicKey: Uint8Array(32) [
      217,  37, 249,  51,   4, 110, 248, 86,
      129, 129, 158,  33, 129,  22,  34, 11,
      243, 168,   6,  80,  69, 197, 206, 28,
       38,  68, 161, 106,  48, 199, 143, 82
    ],
    secretKey: Uint8Array(64) [
      124, 139,  33,   8,  23,  24,  23, 224, 254,  45, 182,
      115, 239,  39, 198, 126, 201, 200,  59, 201, 171, 102,
      241, 178, 100, 248, 221,  73,   2, 180,   6, 100, 217,
       37, 249,  51,   4, 110, 248,  86, 129, 129, 158,  33,
      129,  22,  34,  11, 243, 168,   6,  80,  69, 197, 206,
       28,  38,  68, 161, 106,  48, 199, 143,  82
    ]
  }
}

 */
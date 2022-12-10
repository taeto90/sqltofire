const functions = require("firebase-functions");
const admin = require('firebase-admin');
const otplib = require('otplib');
const cryptoJs = require("crypto-js");
const mysql = require('mysql2');
const cors = require('cors')({
    origin: true
});
var firestore = require("firebase-admin/firestore");


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started
// firebase emulators:start --only functions


var serviceAccount = require("./aptner-auth-config.json");


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://aptner-v1-default-rtdb.asia-southeast1.firebasedatabase.app"
  });


  const DEF_MYSQL_HOST = "aptner-production-db.cluster-ro-cef2dn5ybzgq.ap-northeast-2.rds.amazonaws.com";
  const DEF_MYSQL_USER = "aptnerv2";
  const DEF_MYSQL_PASSWORD = "!@dkvkxmsj34";
  const DEF_MYSQL_DB = "aptner";
  
  const DEF_OTP_KEY = "woijwoif23234zxks";
  const DEF_OTP_IV = "frih3efkfkdo53292";
  
  const DEF_FIREBASE_EMAIL = "@aptner.user";
  const DEF_FIREBASE_OTPDB = "firebase-reflash-token";
  
  const db = firestore.getFirestore();

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});




const pool = mysql.createPool({
    host: DEF_MYSQL_HOST,
    user: DEF_MYSQL_USER,
    password : DEF_MYSQL_PASSWORD,
    database: DEF_MYSQL_DB,
    waitForConnections: true,
    connectionLimit: 30,
    queueLimit: 0
  });  



function dateFormat(date) {

    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    hour = hour >= 10 ? hour : '0' + hour;
    minute = minute >= 10 ? minute : '0' + minute;
    second = second >= 10 ? second : '0' + second;

    return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}




///////////////////////////////////////////////////////////////////////////////////////////////////
// 컬렉션에서 여러 문서 가져오기
// const citiesRef = db.collection('cities');
// const snapshot = await citiesRef.where('capital', '==', true).get();
// if (snapshot.empty) {
//   console.log('No matching documents.');
//   return;
// }  

// snapshot.forEach(doc => {
//   console.log(doc.id, '=>', doc.data());
// });

//컬렉션의 모든 문서 가져오기
// const citiesRef = db.collection('cities');
// const snapshot = await citiesRef.get();
// snapshot.forEach(doc => {
//   console.log(doc.id, '=>', doc.data());
// });
// 필드삭제
// Create a document reference
// const cityRef = db.collection('cities').doc('BJ');

// // Remove the 'capital' field from the document
// const res = await cityRef.update({
//   capital: FieldValue.delete()
// });

// 스케쥴 설정 관련  https://firebase.google.com/docs/functions/schedule-functions


exports.sqltofireBoard_delete = functions.https.onRequest((request, response) =>
cors(request, response, () => {

    const kapt_code='A10025181';
    const date = '2022-12-00 12:00:00';

    pool.query("SELECT * FROM aptner.apt_write where kapt_code= ? and wr_datetime > ? order by wr_datetime desc;", [kapt_code,date], 
    
    async(error, results) => {
        if(results.length > 0){
            for(var i =0; i<results.length; i++){
                try{
                    const docs = await db.collection("testtest")
                .where("wr_id", "==", results[i].wr_id).get();   //sql에서 읽는건 number db에는 string으로 되어있을경우 string으로 변경해야함
                docs.forEach(async(doc) => {
                    await db.collection('testtest').doc(doc.id).delete();
                });
                } catch(error){
                    console.error(error);
                }
            }
        }
    });
}));

exports.sqltofireBoard_create = functions.https.onRequest((request, response) =>
cors(request, response, () => {

    const kapt_code='A10025181';
    const date = '2022-12-00 12:00:00';

    pool.query("SELECT * FROM aptner.apt_write where kapt_code= ? and wr_datetime > ? order by wr_datetime desc;", [kapt_code,date], 
    
    async(error, results) => {
        if(results.length > 0){
            for(var i =0; i<results.length; i++){
                try{
                    const docs = await db.collection("testtest").doc().set(results[i]);
                }catch(error){
                    console.error(error);
                }
            }
        }
    });
}));


exports.sqltofireBoard_update = functions.https.onRequest((request, response) =>
cors(request, response, () => {

    const kapt_code='A10025181';
    const date = '2022-12-00 12:00:00';

    pool.query("SELECT * FROM aptner.apt_write where kapt_code= ? and wr_datetime > ? order by wr_datetime desc;", [kapt_code,date], 
    
    async(error, results) => {
        if(results.length > 0){
            for(var i =0; i<results.length; i++){
                try{
                    const docs = await db.collection("testtest")
                    .where("wr_id", "==", results[i].wr_id).get();   //sql에서 읽는건 number db에는 string으로 되어있을경우 string으로 변경해야함
                    docs.forEach(async(doc) => {
                    await db.collection('testtest').doc(doc.id).update({'jjw':'123123123'});
                });
                }catch(error){
                    console.error(error);
                }
            }
        }
    });
}));


/////////////////////////////////////////////////////////////////////////////////////////
// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
//const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
//const admin = require('firebase-admin');
//admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;

  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await db.collection('messages').add({original: original});

  // Send back a message that we've successfully written the message
  res.json({result: `Message with ID: ${writeResult.id} added.`});
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
    .onCreate((snap, context) => {
      // Grab the current value of what was written to Firestore.
      const original = snap.data().original;

      // Access the parameter `{documentId}` with `context.params`
      functions.logger.log('Uppercasing', context.params.documentId, original);
      
      const uppercase = original.toUpperCase();
      
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to Firestore.
      // Setting an 'uppercase' field in Firestore document returns a Promise.
      return snap.ref.set({uppercase}, {merge: true});
    });



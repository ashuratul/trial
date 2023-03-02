// A Message Sender

const { google } = require('googleapis');

// configure a JWT auth client
const privatekey = require("./privatekey.json");

const authClient = new google.auth.JWT(
    privatekey.client_email,
    null,
    privatekey.private_key,
    ['https://www.googleapis.com/auth/spreadsheets.readonly']);

// authentication
authClient.authorize()
    .then(function (tokens) {
        // console.log(tokens);
        console.log("Authentication successfull.\n");
    })
    .catch(function (error) {
        throw (error);
    });


// things we shouldn’t share with our code
const secrets = require("./secrets.json");

const sheets = google.sheets('v4');
sheets.spreadsheets.values.get({
    // ID of the spreadsheet to retrieve data from
    // A1 notation of the values to retrieve  
    // authorized client  
    spreadsheetId: secrets.spreadsheet_id,
    range: 'Sheet1!A2:D',
    auth: authClient
})
    .then(function (response) {
const rows = response.data.values || [];
if (rows.length) {
        sendMessage(rows);
        }
    })
    .catch(function (err) {
        console.log(err);
    });

const accountSid = secrets.account_sid;
const authToken = secrets.auth_token;
const client = require('twilio')(accountSid, authToken);
const sandboxNumber = secrets.sandbox_number;

function sendMessage(rows) {

   // stop condition
   if (!rows.length) {
        console.log("---------------------------------");
        return;
    }

   // take information from the first row
    const firstRow = rows.shift();
    const appointmentDate = firstRow[0];
    const appointmentTime = firstRow[1];
    const clientName = firstRow[2];
    const phoneNumber = firstRow[3];

   // send the message
    client.messages
        .create({
            from: 'whatsapp:' + sandboxNumber,
            to: 'whatsapp:' + phoneNumber,
            body: `Your appointment is coming up on ${appointmentDate} at ${appointmentTime}.` +
                ` A message for ${clientName}`
        })
        .then(function (message) {
            console.log(message.sid + '\n');
            sendMessage(rows);
        })
        .catch(function (err) {
            console.log(err);
        });

}

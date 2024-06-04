import express from "express";
import cors from "cors";
import database from "../src/databaseConnectivity.js";
import { validatePassword, validateEmail } from "../src/validationFunctions.js";
import { getUserDetails } from "./userDetails.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use("/", express.static("./public", { extensions: ["html"] }));



//API routes for account creation and user authentication  
app.post("/api/sign-up", async (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const firstName = request.body.firstName;
  const lastName = request.body.lastName;
  const phone = request.body.phone;
  
  // Check if password and email are valid
  if (validatePassword(password) && await validateEmail(email)) {
    try {
      // Get the maximum ID from the CLIENTS table
      const maxId = await database.raw(`SELECT MAX(id) AS maxId FROM CLIENTS`);
      let newId = 1; // Default new ID if no clients exist in the table
      
      if (maxId.length > 0 && maxId[0].maxId !== null) {
        newId = maxId[0].maxId + 1; // Increase the ID by 1
      }

      await database.raw(`
        INSERT INTO CLIENTS (id, first_name, last_name, email, password, phone)
        VALUES (${newId}, '${firstName}', '${lastName}', '${email}', '${password}', '${phone}')
      `);

      const newAccount = await database.raw(`SELECT * FROM CLIENTS WHERE id = ${newId}`);

      response.status(200);
      response.json(newAccount);
    } catch (error) {
      response.status(500);
      response.json({ error: "Internal server error" });
    }
  } else if (!validatePassword(password)) {
    response.status(401);
    response.json("Password is invalid");
  } else {
    response.status(401);
    response.json("Email is invalid");
  }
});


app.post("/api/login", async (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  const authentication = await database.raw(
    `select email, id from CLIENTS where email='${email}' AND password='${password}'`
  );

  if (authentication.length == 0) {  //no account matches
    response.status(401);
    response.json("Email and password do not match!");
  } else {
    response.status(200);
    response.json(authentication[0]);
  }
});


app.get("/api/hotels", async (request, response) => {
  try {
    const result = await database.raw(`SELECT * FROM HOTELS`);
    response.status(200).json(result);
  } catch (error) {
    console.error('Database query error:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

//API for hotels room
app.get("/api/rooms/:id", async (request, response) => {
  const id = Number(request.params.id);
  try {
  
    const result = await database.raw('SELECT * FROM ROOMS WHERE hotel_id = ?', [id]);
  
    if (result.length === 0) {
      response.status(404).json({ error: 'No rooms found for the specified hotel ID' });
    } else {
      response.status(200).json(result);
    }
  } catch (error) {
    console.error('Database query error:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/rezervation/:id', async (req, res) => {
  const room_id = req.body.roomId;
  const check_in_date = req.body.checkin;
  const credit_card = req.body.cardNumber;
  const pin = req.body.cardPin;
  const id = Number(req.params.id);

  const formattedCheckInDate = new Date(check_in_date?.[0]).toISOString().slice(0, 19).replace('T', ' ');
  const formattedCheckOutDate = new Date(check_in_date?.[1]).toISOString().slice(0, 19).replace('T', ' ');
  
  try {

      const maxId = await database.raw(`SELECT MAX(id) AS maxId FROM CLIENT_ROOM`);
      let newId = 1; // Default new ID if no clients exist in the table
      
      if (maxId.length > 0 && maxId[0].maxId !== null) {
        newId = maxId[0].maxId + 1; // Increase the ID by 1
      }
      // Insert data into the CLIENT_ROOM table
      await database.raw(`
          INSERT INTO CLIENT_ROOM (id, client_id, room_id, check_in_date, check_out_date, credit_card, pin) 
          VALUES (${newId}, ${id}, ${room_id}, '${formattedCheckInDate}', '${formattedCheckOutDate}', '${credit_card}', ${pin})
      `);
      res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error) {
      console.error('Error inserting data into CLIENT_ROOM table:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});



app.get("/api/trips", async (request, response) => {
  try {
    const result = await database.raw(`SELECT * FROM TRIPS`);
    response.status(200).json(result);
  } catch (error) {
    console.error('Database query error:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/trips/:id', async (req, res) => {
  const trip_id = req.body.tripId;
  const id = Number(req.params.id);

  try {

      const maxId = await database.raw(`SELECT MAX(id) AS maxId FROM CLIENT_TRIP`);
      let newId = 1; // Default new ID if no clients exist in the table
      
      if (maxId.length > 0 && maxId[0].maxId !== null) {
        newId = maxId[0].maxId + 1; // Increase the ID by 1
      }
      // Insert data into the CLIENT_ROOM table
      await database.raw(`
          INSERT INTO CLIENT_TRIP (id, client_id, trip_id) 
          VALUES (${newId}, ${id}, ${trip_id})
      `);

      res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error) {
      console.error('Error inserting data into CLIENT_TRIP table:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/user/:id', async (req, res) => {
  const userId = req.params.id;
  
  try {
    const userDetails = await getUserDetails(userId);
    res.json(userDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.all("/*", async (request, response) => {
  response.status(404);
  response.json({ error: "This route does not exist!" });
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
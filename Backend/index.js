const express = require("express"); // This imports Express Framework.
const app = express(); // It creates an app object to build a web server, used to define routes, apply middleware, and handle HTTP requests.

const { initializeDatabase } = require("./db/db.connect");
initializeDatabase();

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: "*",
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json()); // MIDDLEWARE - It automatically parses incoming request bodies with JSON data and makes them available under req.body for further processing in route handlers.

const SalesAgent = require("./models/salesAgent.model");

app.get("/", (req, res) => {
  res.send(` 
    <div style="font-family: Arial, sans-serif; background: #f0f4f8; padding: 50px; text-align: center;">
      <h1 style="color: #2c3e50; font-size: 3rem;">✨ Welcome to <span style="color: #0d6efd;">ANVAYA</span> ✨</h1>
      <p style="font-size: 1.2rem; color: #555;">Your powerful CRM solution to manage leads, clients, and sales – all in one place.</p>
    </div>
    `);
});

// ===============================
// ********* SALES AGENT *********
// ===============================

async function addSalesAgent(newSalesAgent) {
  try {
    const savedAgent = new SalesAgent(newSalesAgent);
    return await savedAgent.save();
  } catch (error) {
    throw error;
  }
}

app.post("/agents", async (req, res) => {
  try {
    const { name, email } = req.body;

    //    Name validation
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        error: "Invalid input: 'name' is required and must be a string.",
      });
    }

    // email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "Invalid input: 'email' must be a valid address." });
    }

    // check for duplicate email
    const existingAgent = await SalesAgent.findOne({ email });
    if (existingAgent) {
      return res
        .status(409)
        .json({ error: `Sales agent with eamil '${email}' already exists.` });
    }

    // calling addSalesAgent function
    const savedAgent = await addSalesAgent(req.body);
    res.status(201).json({
      success: true,
      message: "Sales Agent added successfully.",
      "Sales Agent": savedAgent,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

async function getAllSalesAgent() {
  try {
    const agents = await SalesAgent.find();
    return agents;
  } catch (error) {
    throw error;
  }
}

app.get("/agents", async (req, res) => {
  try {
    const agents = await getAllSalesAgent();
    if (agents.length != 0) {
      res.json(agents);
    } else {
      res.status(404).json({ error: "Agents not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agents." });
  }
});
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server is running on PORT", PORT);
});

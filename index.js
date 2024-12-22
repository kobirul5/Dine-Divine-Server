const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgvjh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const foodCollections = client.db("foodDB").collection("foods")
    // get all food
    app.get("/allFood", async(req, res)=>{
      const result = await foodCollections.find().toArray()
      res.send(result)
    })

    // get single food data id
    app.get("/food/:id", async(req, res)=>{
      const id = req.params.id
      const objectId = new ObjectId(id)
      const result = await foodCollections.findOne({_id: objectId})
      res.send(result)
    })
    // get single food data email
    app.get("/foods/:email", async(req, res)=>{
      const email = req.params.email
      const result = await foodCollections.find({"addedBy.email": email}).toArray()
      res.send(result)
    })

    // post food

    app.post("/allFood", async(req, res) =>{
      const newFood = req.body;
      const result = await foodCollections.insertOne(newFood)
      console.log(result, newFood)
      res.send(result)
    })


    
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get("/", (req, res)=>{
    res.send("server is running")
})
app.listen(port, ()=>{
    console.log("app running at Port:-", port)
})
const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser())

const verifyToken = (req, res, next)=>{
  const token = req.cookies?.token
  if(!token){
    return res.status(401).send({massage: "Unauthorize access"})
  }
  // verify token
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded)=>{
    if(err){
      return res.status(401).send({massage: "Unauthorize access"})
    }
    req.user = decoded;  
    next()
  })

  
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgvjh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const foodPurchaseCollections = client.db("foodDB").collection("purchase")


    // auth jwt api
    app.post("/jwt" , (req, res)=>{
      const user = req.body;
      const token =  jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: "24h"});

      res.cookie('token', token, {
        httpOnly: true,
        secure: false
      }).send({success: true})
    })

    app.post('/logout', (req,res)=>{
      res.clearCookie('token', {
        httpOnly: true,
        secure: false
      })
      .send({success: true})
    })

    // get all food
    app.get("/allFood",  async(req, res)=>{
      const result = await foodCollections.find().toArray()
      res.send(result)
    })

    // get single food data id
    app.get("/food/:id", verifyToken, async(req, res)=>{
      const id = req.params.id
      const objectId = new ObjectId(id)
      const result = await foodCollections.findOne({_id: objectId})
      res.send(result)
    })
    // get single food data email
    app.get("/foods/:email", verifyToken, async(req, res)=>{
      const email = req.params.email
      const result = await foodCollections.find({
        email: email}).toArray();
        
      res.send(result)
    })
    // get my orders 
    app.get("/myOrders/:email", verifyToken, async (req, res)=>{
      const email = req.params.email;
      const result = await foodPurchaseCollections.find({buyerEmail: email}).toArray();
      res.send(result)
    })

    // post food

    app.post("/allFood", async(req, res) =>{
      const newFood = req.body;
      const result = await foodCollections.insertOne(newFood)
      res.send(result)
    })
    // food purchase
    app.post("/foodPurchase", async(req, res)=>{
      const newPurchase = req.body;
      const result = await foodPurchaseCollections.insertOne(newPurchase);
      res.send(result)
    })

    // update data
    app.put(`/food/:id`, async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updateFood= req.body;
      const food = {
        $set: {
          foodName:updateFood.foodName,
            foodImage: updateFood.foodImage,
            foodCategory: updateFood.foodCategory,
            quantity: updateFood.quantity,
            price: updateFood.price,
            foodOrigin: updateFood.foodOrigin,
            description: updateFood.description,
            email: updateFood.email,
            nam: updateFood.name
        }
      }

      const result = await foodCollections.updateOne(filter, food, options)
      res.send(result)
    })

    app.delete("/myOrders/:id", async(req,res)=>{
      const id = req.params.id
      const objectId = new ObjectId(id)
      const result = await foodPurchaseCollections.deleteOne({_id: objectId})
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
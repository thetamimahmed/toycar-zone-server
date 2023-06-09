const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rgrretg.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // client.connect((err)=>{
    //     if(err){
    //         console.error(err);
    //         return;
    //     }
    // });

    const toyCollection = client.db("toyCarZoneDB").collection("toyCar");
    //get all toyCar
    app.get("/toys", async(req, res)=>{
        const result = await toyCollection.find({}).limit(20).toArray();
        res.send(result)
    })

    //create index
    // const indexKeys = { name: 1 };
    // const indexOptions = { name: "toyName" };
    // const result = await toyCollection.createIndex(indexKeys, indexOptions);

    //get single toy
    app.get("/toys/:id", async(req, res)=>{
        const id =req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await toyCollection.findOne(query)
        res.send(result)
    })
    

    //get toy by category
    app.get("/alltoy/:category", async(req, res)=>{
        const category = req.params.category;
        const query = {category : category};
        const result = await toyCollection.find(query).toArray()
        res.send(result)
    })

    //get car by email
    app.get("/myToy", async(req, res)=>{
        let query = {}
        let sort = {}
        if(req.query?.email){
            query = {email: req.query.email}
            sort = {price: req.query.sort == 'true' ? 1 : -1}
            console.log(query, sort)
        }
        const result = await toyCollection.find(query).sort(sort).toArray()
        res.send(result)
    })


    //post toy car
    app.post("/toys", async(req, res)=>{
        const toy = req.body;
        const result = await toyCollection.insertOne(toy)
        res.send(result)
    })

    //put toy car
    app.put("/toys/:id", async(req, res)=>{
        const id =req.params.id;
        const toy = req.body;
        const filter = {_id: new ObjectId(id)}
        const updateDoc = {
            $set: {
              price: toy.price,
              quantity: toy.quantity,
              description: toy.description
            },
          };
        const result = await toyCollection.updateOne(filter, updateDoc)
        res.send(result)
    })


    //get toys by searchText
    app.get("/getToysBySearch/:text", async(req,res)=>{
        const text = req.params.text;
        const query = {name : text};
        const result = await toyCollection.find(query).toArray()
        res.send(result)
    })

    //delete single toy
    app.delete("/toys/:id", async(req, res)=>{
        const id =req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await toyCollection.deleteOne(query)
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req,res)=>{
    res.send("Running ToyCar Zone")
})

app.listen(port, ()=>{
    console.log(`ToyCar Zone Is Running On:${port}`)
})
const express = require('express');

const mongodb = require('mongodb');
const path = require('path');

const fs = require('fs');

const multer = require('multer');
let imgname = '';
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      return cb(null, './uploads/')
   },
   filename: function (req, file, cb) {
      imgname = Date.now() + file.originalname;
      return cb(null, imgname);
   }
});
const upload = multer({ storage: storage });


const app = express();
app.use(express.static(path.join(__dirname, './mongodb')));
app.use(express.static('uploads'));

app.set('view engine', 'ejs');
const body = require('body-parser');
const bs = body.urlencoded({ extended: true });

const mongo = require('mongodb');

const mongoclient = mongo.MongoClient;

const url = "mongodb://127.0.0.1/";

const client = new mongoclient(url);


async function data() {
   try {



      let userdata2 = '';

      // insert data 

      app.get('/crud', async (req, res) => {

         await client.connect();
         const db = client.db("student");
         const colection = db.collection("info");
         let user = await colection.find({}).toArray();

         res.render('index', {
            data: user,
            userdata2: userdata2
         })
      });
      app.post('/savedata', upload.single('image'), async (req, res) => {

         let id = req.body.hid;
         let name = req.body.name;

         if (id != '') {

            await client.connect();
            const db = client.db("student");
            const colection = db.collection("info");
            let user = await colection.findOne({ _id: new mongodb.ObjectId(id) });

            old = (user.image != '') ? user.image : '';

            if (req.file && imgname != '') {
               let img1 = "uploads/" + userdata2.image;

               fs.unlink(img1, () => {
                  console.log("delete");
               });
            }


            await colection.updateOne({
               _id: new mongodb.ObjectId(id)
            }, {
               $set: {
                  name: req.body.name,
                  age: req.body.age,
                  email: req.body.email,
                  image: (req.file && imgname != '') ? imgname : old
               }

            })

         } else {
            if(name != '') {
            let data = {
               name: req.body.name,
               email: req.body.email,
               age: req.body.age,
               image: imgname
            }

            await client.connect();
            const db = client.db("student");
            const colection = db.collection("info");

            await colection.insertOne(data);
         }

         }

         userdata2 = '';
         res.redirect('/crud')

      });


      app.get('/del/:id', async (req, res) => {

         await client.connect();
         const db = client.db("student");
         const colection = db.collection("info");
         let id = req.params.id;
         let user = await colection.findOne({ _id: new mongodb.ObjectId(id) });

         let img = "uploads/" + user.image;

         fs.unlink(img, () => {
            console.log("delete");
         });



         await colection.deleteOne({ _id: new mongodb.ObjectId(id) });
         res.redirect('/crud');

      });

      app.get('/edit/:id', async (req, res) => {

         await client.connect();
         const db = client.db("student");
         const colection = db.collection("info");
         let user = await colection.find({}).toArray();

         let id = req.params.id;
         userdata2 = user.find((i) => {
            return i._id == id;
         });
         res.render('index', {
            data: user,
            userdata2: userdata2
         });

      });



   } catch (e) {
      console.error(e);
   }
}

data();



app.listen(7171, "127.0.0.1", () => {
   console.log("listen port 7171");
})
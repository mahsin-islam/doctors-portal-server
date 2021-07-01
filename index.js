const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express()

//middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors')); // doctors holo image ba file jai folder a rakhte chai tar name
app.use(fileUpload());

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.knazp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const appointmentCollection = client.db("doctorsPortal").collection("appointments");
    const doctorCollection = client.db("doctorsPortal").collection("doctors");
    app.get('/', (req, res) => {
        res.send('Database is connected!')
    });

    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        console.log(appointment)
        appointmentCollection.insertOne(appointment)
            .then(result => {
                console.log("result" + result);
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/appointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        // appointmentCollection.find({date: date.date})
        // .toArray((err, documents) => {
        //     res.send(documents);
        // })
        doctorCollection.find({ email: email.email })
            .toArray((err, doctors) => {
                const filter = { date: date.date }
                console.log(doctors.length + email.email)
                if (doctors.length === 0) {
                    filter.email = email;
                }
                appointmentCollection.find(filter)
                    .toArray((err, documents) => {
                        // console.log(email, date.date, doctors, documents)
                        res.send(documents);
                    })
            })
    })

    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        doctorCollection.insertOne({ name, email, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

    // app.post('/appointmentsByDate', (req, res) => {
    //     const date = req.body;
    //     const email = req.body.email;
    //     console.log(date.date)
    //     console.log(email.email)
    //     doctorCollection.find({email: email})
    //         .toArray((err, doctors) => {
    //             const filter = { date: date.date }
    //             console.log("filter"+filter)
    //             console.log(doctors.length)
    //             if(doctors.length === 0){
    //                 filter.email = email;
    //             }

    //             appointmentCollection.find(filter)
    //             .toArray((err, documents) => {
    //                 res.send(documents);
    //             })
    //         })

    // });
    // app.post('/addADoctor', (req, res) => {

    //     const file = req.files.file;
    //     const name = req.body.name;
    //     const email = req.body.email;
    //     console.log(name,email,file);
    //     file.mv(`${__dirname}/doctors/${file.name}`, err=>{
    //         if(err) {
    //             console.log(err);
    //             return res.status(500).send({msg: 'Failes to upload image'})
    //         }
    //         return res.send({name: file.name, path: `/${file.name}`})
    //     })
    // })

    // app.post('/addADoctor', (req, res) => {
    //     const file = req.files.file;
    //     const name = req.body.name;
    //     const email = req.body.email;
    //     console.log(name,email,file);
    //     const filePath = `${__dirname}/doctors/${file.name}`
    //     file.mv(filePath, err=>{
    //         if(err) {
    //             console.log(err);
    //             return res.status(500).send({msg: 'Failes to upload image'})
    //         }
    //        const newImg = fs.readFileSync(filePath);
    //        const encImg = newImg.toString('base64');
    //        var image = {
    //            // description: req.body.description,
    //            contentType: req.files.file.mimetype,
    //            size: req.files.file.size,
    //         //    img: Buffer(encImg, 'base64')
    //            img: Buffer.from(encImg, 'base64')
    //        };

    //         // doctorCollection.insertOne({ name, email, img:file.name })
    //         doctorCollection.insertOne({ name, email, image })
    //         .then(result => {
    //             fs.remove(filePath, error => {
    //                 if(error) {
    //                     console.log(error);
    //                     res.status(500).send({msg: 'Failed to upload image'});
    //                 }
    //                 res.send(result.insertedCount > 0);
    //             })
    //         })
    //          // return res.send({name: file.name, path: `/${file.name}`})
    //     })
    // })
});


app.listen(port);
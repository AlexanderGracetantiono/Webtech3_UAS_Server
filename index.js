
/* 
file yang perlu dikumpulkan di praktikum
   1) index.js
   2) package.json
   3) .env
   4) db.sql
file-file tersebut nanti digabung jadi 1 file zip
*/
const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql'); // load mysql package
require('dotenv').config(); // load .env file
var buku = [
    {"kd_buku": "001", "judul": "Komi Can't Communicate vol 1", "isbn": "978-1-9747-0712-6", "cover": "https://upload.wikimedia.org/wikipedia/id/d/d1/Cover_Art_Komi-san_wa%2C_Komyushou_desu_Vol_1.jpg", "penulis": "Tomohito Oda", "tahun": 2016, "ket": "On her first day attending the elite Itan Private High School, the main setting of the story, Shouko"},
    {"kd_buku": "002", "judul": "Overlord 1: The Undead King", "isbn": "978-0-316-27224-7", "cover": "https://en.wikipedia.org/wiki/Overlord_(novel_series)#/media/File:Overlord_novel.jpg", "penulis": "Kugane Maruyama", "tahun": 2016, "ket":"Momonga is an average salaryman who spends most of his time playing the game YGGDRASIL. Sadly, YGGDR" },
    {"kd_buku": "003", "judul": "Five Nights at Freddy\'s: The Silver Eyes", "isbn": "978-1338134377", "cover": "https://images-na.ssl-images-amazon.com/images/I/51kkeE8Jv+L._SX326_BO1,204,203,200_.jpg", "penulis": "Scott Cawthon and Kira Breed-Wrisley", "tahun": 2015, "ket": "The book follows a young woman named Charlotte, who reunites with her childhood friends on the anniv"},
    {"kd_buku": "004", "judul": "Gravity Falls: Journal 3", "isbn": "978-1484746691", "cover": "https://static.wikia.nocookie.net/gravityfalls/images/9/90/Journal_3%27s_dust_cover_1.jpg/revision/latest/scale-to-width-down/700?cb=20160718094558", "penulis": "Rob Renzetti and Alex Hirsch", "tahun": 2016, "ket": "Journal 3 brims with every page ever seen on the show plus all-new pages with monsters and secrets"},
    {"kd_buku": "005", "judul": "Fantastic Beasts and Where to Find Them", "isbn": "0-439-29501-7", "cover": "https://upload.wikimedia.org/wikipedia/en/8/8d/Fantastic_beasts.JPG", "penulis": "J. K. Rowling", "tahun": 2010, "ket": "'Fantastic Beasts purports to be a reproduction of a textbook owned by Harry Potter and written by ma" },
    ];

app.use(express.json());


    app.get('/', (req, res) => {
        var usage = {
            "GET all buku": "http://localhost:3000/buku",
            "GET with Limit and Page": "http://localhost:3000/buku?limit=2&page=2",
            "GET with Kode_buku": "http://localhost:3000/buku/001",
            "GET with Kategori": "http://localhost:3000/buku/kategori/Novel",
            "GET with Penulis": "http://localhost:3000/penulis/Kugane",
            "GET with Judul": "http://localhost:3000/buku/judul/Overlord",
            "GET with Tahun": "http://localhost:3000/buku/tahun/2016",
        }
        var response = {
            "message": "Welcome to Perpustakaan API",
            "List Usage GET:": usage,
            "Usage Delete:": "http://localhost:3000/buku/001",
            "Usage Update:": "http://localhost:3000/buku/001",
            "Usage Post:": "http://localhost:3000/buku",
        };
        res.status(200).send(response);
    });

app.get('/buku', (req, res) => { //variable buku
    var connection = mysql.createConnection({ 
        host : process.env.DB_HOST,
        user : process.env.DB_USER, 
        password : process.env.DB_PASSWORD, 
        database : process.env.DB_NAME 
        });

        var sorte = req.query.sort;
    var orderquery = "";
    if (sorte != null) {
        var desce = sorte.includes("-");
        if (desce) {
            var a =sorte.substring(1)
            orderquery +=  " ORDER BY " + a + " DESC "
        } else {
            orderquery += " ORDER BY " + sorte + " ASC"
        }
    }
    connection.connect();
    connection.query("SELECT * FROM buku", 
        function (error, results, fields){
            if (error){
                res.status(500).send({
                    errors: [
                        {
                            field: "-",
                            message: "database error occured",
                        }
                    ]
                })
            }
            else if (results.length == 0){
                res.status(404).send({
                    errors: [
                        {
                            message: "buku is not found.",
                        }
                    ]
                })
            }
            else{
                page = 1;
    limit = 20;
    if (req.query.keyword){
        results = results.filter((book) => {
            return (book.judul.toLowerCase().includes(req.query.keyword.toLowerCase()))
        })
    }
    if (req.query.cover){
        results = results.filter((book) => {
            return (book.cover.toLowerCase() == req.query.cover.toLowerCase())
        })
    }
    if (req.query.isbn){
        results = results.filter((book) => {
            return (book.isbn.toLowerCase() == req.query.isbn.toLowerCase())
        })
    }
    if (req.query.penulis){
        results = results.filter((book) => {
            return (book.penulis.toLowerCase() == req.query.penulis.toLowerCase())
        })
    }
    if (req.query.tahun){
        results = results.filter((book) => {
            return (book.tahun.toLowerCase() == req.query.tahun.toLowerCase())
        })
    }
    if (req.query.ket){
        results = results.filter((book) => {
            return (book.ket.toLowerCase() == req.query.ket.toLowerCase())
        })
    }

    var errors = [];
    if (req.query.page){
        if (isNaN(req.query.page)){
            errors.push({
                field: "page",
                message: "Page should be a number",
            });
        }
        else if (parseInt(req.query.page) <= 0){
            errors.push({
                field: "page",
                message: "Page should be greater than zero",
            });
        }
        else {
            page = parseInt(req.query.page);
        }
    }
    if (req.query.limit){
        if (isNaN(req.query.limit)){
            errors.push({
                field: "limit",
                message: "Limit should be a number",
            });
        }
        else if (parseInt(req.query.limit) <= 0){
            errors.push({
                field: "limit",
                message: "Limit should be greater than zero",
            });
        }
        else {
            limit = parseInt(req.query.limit);
        }
    }

    var indexMin = (page - 1) * limit;
    if (indexMin < 0){
        indexMin = 0;
    }

    var indexMax = indexMin + limit;
    if (indexMax >= results.length) {
        indexMax = results.length;
    }

    paginatedResult = results.filter((book, index) =>
        index >= indexMin && index < indexMax
    );

    response = {
        data: paginatedResult,
        meta: {
            page: page,
            limit: limit,
            totalPages: Math.ceil(results.length / limit),
            totalData: results.length
        }
    };

    if (errors.length > 0){
        res.status(400).send({
            errors
        });
    }
    else {
        res.status(200).send(response)
    }
            }
        connection.end();
    });   
})


app.get('/buku/:kd_buku', (req, res) => {
    var connection = mysql.createConnection({ 
        host : process.env.DB_HOST,
        user : process.env.DB_USER, 
        password : process.env.DB_PASSWORD, 
        database : process.env.DB_NAME 
        });
    connection.connect();
    
    connection.query("select kd_buku, judul, isbn, cover, penulis, tahun, ket from buku " 
                    + " where kd_buku = ? ", [req.params.kd_buku], 
        function(error, results, fields){
            if (error){
                res.status(500).send({
                    errors: [
                        {
                            field: "-",
                            message: "database error occured",
                        }
                    ]
                })
            }
            else if (results.length == 0){
                res.status(404).send({
                    errors: [
                        {
                            field: "kd_buku",
                            message: "Buku with id " + req.params.kd_buku + " is not found.",
                        }
                    ]
                })
            }
            else {
                res.status(200).send(results[0]);
            }
            connection.end();
    });
});


app.get('/buku/kategori/:kategori', (req, res) => {
    var connection = mysql.createConnection({ 
        host : process.env.DB_HOST,
        user : process.env.DB_USER, 
        password : process.env.DB_PASSWORD, 
        database : process.env.DB_NAME 
        });
    connection.connect();
    
    connection.query("select * from buku " 
                    + " where kategori_buku = ? ", [req.params.kategori], 
        function(error, results, fields){
            if (error){
                res.status(500).send({
                    errors: [
                        {
                            field: "-",
                            message: "database error occured",
                        }
                    ]
                })
            }
            else if (results.length == 0){
                res.status(404).send({
                    errors: [
                        {
                            field: "kategori_buku",
                            message: "Buku with kategori " + req.params.kategori + " is not found.",
                        }
                    ]
                })
            }
            else {
                res.status(200).send(results);
            }
            connection.end();
    });
});

app.get('/buku/penulis/:penulis', (req, res) => {
    var connection = mysql.createConnection({ 
        host : process.env.DB_HOST,
        user : process.env.DB_USER, 
        password : process.env.DB_PASSWORD, 
        database : process.env.DB_NAME 
        });
    connection.connect();
    
    connection.query("select * from buku " 
    + " where penulis like '%"+req.params.penulis+"%' ",
        function(error, results, fields){
            if (error){
                res.status(500).send({
                    errors: [
                        {
                            field: "-",
                            message: "database error occured",
                        }
                    ]
                })
            }
            else if (results.length == 0){
                res.status(404).send({
                    errors: [
                        {
                            field: "penulis",
                            message: "Buku with penulis " + req.params.penulis + " is not found.",
                        }
                    ]
                })
            }
            else {
                res.status(200).send(results);
            }
            connection.end();
    });
});

app.get('/buku/judul/:judul', (req, res) => {
    var connection = mysql.createConnection({ 
        host : process.env.DB_HOST,
        user : process.env.DB_USER, 
        password : process.env.DB_PASSWORD, 
        database : process.env.DB_NAME 
        });
    connection.connect();
    
    connection.query("select * from buku " 
    + " where judul like '%"+req.params.judul+"%' ",
        function(error, results, fields){
            if (error){
                res.status(500).send({
                    errors: [
                        {
                            field: "-",
                            message: "database error occured",
                        }
                    ]
                })
            }
            else if (results.length == 0){
                res.status(404).send({
                    errors: [
                        {
                            field: "judul",
                            message: "Buku with judul " + req.params.judul + " is not found.",
                        }
                    ]
                })
            }
            else {
                res.status(200).send(results);
            }
            connection.end();
    });
});

app.get('/buku/tahun/:tahun', (req, res) => {
    var connection = mysql.createConnection({ 
        host : process.env.DB_HOST,
        user : process.env.DB_USER, 
        password : process.env.DB_PASSWORD, 
        database : process.env.DB_NAME 
        });
    connection.connect();
    
    connection.query("select * from buku " 
                    + " where tahun  = ? ", [req.params.tahun], 
        function(error, results, fields){
            if (error){
                res.status(500).send({
                    errors: [
                        {
                            field: "-",
                            message: "database error occured",
                        }
                    ]
                })
            }
            else if (results.length == 0){
                res.status(404).send({
                    errors: [
                        {
                            field: "tahun",
                            message: "Buku with tahun " + req.params.tahun + " is not found.",
                        }
                    ]
                })
            }
            else {
                res.status(200).send(results);
            }
            connection.end();
    });
});



app.listen(port, () =>      
    console.log(`Example app listening at http://localhost:${port}`)
)

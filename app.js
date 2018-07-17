
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var fs = require('fs');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var io = require('socket.io')(serv, {});
var nodemailer = require('nodemailer');
var usersDB;

// Postavljanje express engine koji ce template koristit
// staticke filove (skripte, css, slike i to)
app.engine('.html',require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));


// get zahtjev na home/root direktorij
app.get('/', function(req, res){
    //res.send("You need to login to play !!");
    res.render('index',{
        show: false,
        message: "You need to login to play!!"
    });
});


// Score izlistavanje, u ovom je i sortiranje usera i pronalazak najveceg
// koristim JS funkciju sort nije mi se dalo pisat :D
app.get('/score', function(req, res){
    var listUsers = []; // lista usera koju saljemo na stranicu
    var lenUsers = usersDB.users.length; // racunam vani duljinu da for petlja nebi svaki put racunala duzinu

    for(var i = 0; i < lenUsers; i++){
        // pravim niz od svih usera u bazi ... samo njihov username i score
        // da nebi dosli nezeljeni podatci na stranicu
        var users = {
            username: '',
            score: 0
        }
        users.username = usersDB.users[i].username;
        users.score = usersDB.users[i].score;
        listUsers.push(users);

    }
    listUsers.sort(function(a,b){
        return a.score < b.score;
    });

    // ovdje provjeravam koji je user na vrhu ...tj koji je score najveci
    // i odmah pozivam funkciju da se salje mail useru ako mu je oboren rekord
    if(listUsers[0].score > usersDB.bestuser.score){
        //sendMail(usersDB.bestuser.username);
        usersDB.bestuser = listUsers[0];
        updateDB();
    } else {
        usersDB.bestuser = listUsers[0];
    }

    res.render('score',{listUsers});
})

app.get('/registration', function(req, res){
    res.render('register',{error: false});
});

// post metoda za register kroz formu
app.post('/register', function(req, res, next){
    // uzimam podatke usera koje je unjeo u input polja
    var obj = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        score: 0
    }

    var lenUsers = usersDB.users.length;
    var hasUser = false;

    // provjera postoji li vec taj username u bazi
    for(var i = 0; i < lenUsers; i++){
        if(obj.username === usersDB.users[i].username){
            hasUser = true;
        }
    }

    if(hasUser){

        res.render('register',{
            msg: "Username taken..",
            error: true
        });
    } else {
        addUser(obj); // ako nema posalji usera ovoj funkciji ona odradi save update i sve sta treba sa bazom
        res.render('register',{
            msg: "You may login now!",
            error: true
        });
    }
});

// post metoda za login kroz formu
app.post('/login', function(req, res, next){
    // uzimam username i pass od usera
    var user = {
        username: req.body.username,
        password: req.body.password
    }
    console.log(user);

    var lenUsers = usersDB.users.length;
    var hasUser = false;
    var userScore = 0; // defaultni score za usera

    for(var i = 0; i < lenUsers; i++){
        if(user.username === usersDB.users[i].username){ // prvo provjera postoji li taj username u bazi
            var hash = usersDB.users[i].password; // ako postoji uzmi njegov hash i spremi ga ovde
            if(bcrypt.compareSync(user.password,hash)){ // slanje ovoj funkciji od "bcryptjs" hash iz baze i pass
                hasUser = true;                         // koji je user unjeo prilikom login
                userScore = usersDB.users[i].score;
                console.log(usersDB);
            }
        }
    }
    if(hasUser){
        // ako postoji renderaj mu index stranicu(igru), i posalji ove parametre score i usernam
        res.location('/');
        res.render('index',{
            show: true,
            score: userScore,
            username: user.username
        });

    } else {
        // ako nema nema :D
        res.render('register',{
            msg: "Incorrect username or password",
            error: true
        });
    }
});


// inicijalizacija socket.io nista posebno samo da mozemo primit score od usera
io.sockets.on('connection', function(socket){
    console.log("connection established");

    socket.on('new score',function(data){ // score od klijentske strane
        appendScore(data);
    });

});

// provjera postoji li users.txt file (tj nasa baza) i ako nema napravi je
fs.exists('./users.txt', function(exists){
    if(exists){
        var readContent = function(callback){
            fs.readFile('./users.txt', function(err, content){
                if(err){
                    return callback(err);
                }
                callback(null, content);
            });
        }
    } else {
        var obj = {
            users:[],
            bestuser:''
        }

        console.log('Creating file...');
        fs.writeFile('./users.txt', JSON.stringify(obj), function(err){
            if(err){
                console.log(err);
            }
            console.log('File created...');
        });

        var readContent = function(callback){
            fs.readFile('./users.txt', function(err, content){
                if(err){
                    return callback(err);
                }
                callback(null, content);
            });
        }
    }

    readContent(function(err, content){
        if(err){
            console.log(err);
        }
        usersDB = JSON.parse(content.toString());
    });
});

serv.listen(2000); // server port
console.log("Listening on port: 2000");

var addUser = function(data){

    // kreirati hash od passworda prilikom registracije
    // prvo ide Salt pa se onda tek pravi hash

    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(data.password, salt, function(err, hash){
            data.password = hash; // mijenjam od usera sto sam poslao password u dobiveni hash

            usersDB.users.push(data); // update niz usera

            updateDB(); // ponovo update baze
        });
    });
}

var appendScore = function(data){
    // posto prilikom novog skora moram izbrisat citavog usera iz niza
    // prvo neke njegove podatke moram spremit pa ih ponovo gurnuti u niz usera
    var updatedUser = {
        username: data.username,
        password: 0,
        email: '',
        score: data.score
    }
    var isBetter = false;

    var lenUsers = usersDB.users.length;

    console.log(usersDB);
    for(var i = 0; i < lenUsers; i++){
        if(usersDB.users[i].username == data.username){
            if(usersDB.users[i].score < data.score){ // gledam isplati li se mijenjat score

                updatedUser.password = usersDB.users[i].password; // pohranjujem password i email
                updatedUser.email = usersDB.users[i].email;
                isBetter = true;

                //usersDB.users.splice(i);
                delete usersDB.users[i];
            }
        }

    }
    if(isBetter){
        usersDB.users.push(updatedUser);
        updateDB(); // update baze
    }
}

var updateDB = function(){

    var obj = {
        users:[],
        bestuser: ''
    };

    for(var i = 0; i < usersDB.users.length; i++){
        if(usersDB.users[i] != null){
            obj.users.push(usersDB.users[i]);
        }
    }
    obj.bestuser = usersDB.bestuser;
    // =====================================================================

    try{
        console.log('Deleteing...')
        fs.unlinkSync('./users.txt');// brisem staru bazu
    } catch(err){
        console.log(err);
    }

    // Kreiram novu bazu sa svim userima bezz null vrijednosti cisit useri sa
    // svim podatcima
    console.log('Creating new file...');
    fs.writeFile('./users.txt', JSON.stringify(obj), function(err){
        if(err){
            console.log(err);
        }
        console.log('File created...');
    });

    // ====================================================================
    // Citam file users.txt (bazu) i spremam je u globalnu var usersDB
    var readContent = function(callback){
        fs.readFile('./users.txt', function(err, content){
            if(err){
                return callback(err);
            }
            callback(null, content);
        });
    }

    readContent(function(err, content){
        if(err){
            console.log(err);
        }
        usersDB = JSON.parse(content.toString());
        console.log(usersDB);
    });
    // ====================================================================
}

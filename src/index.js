const path = require('path')
const http = require('http')
const express = require('express')
const bodyParser = require("body-parser")
const sockeio = require('socket.io')
const mongoose = require("mongoose")
const ejs = require("ejs")
const {generateMessage,generateLocationMessage} =require('./utils/messages')
const {addUser,removeUser,getUser,getUsersinRoom} =require('./utils/users')

const app = express();
const server =http.createServer(app)
const io = sockeio(server);

const port = 3000;
const publicDirpath = path.join(__dirname,'../public')

app.use(express.static(publicDirpath))
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true , useUnifiedTopology: true});
app.use(bodyParser.urlencoded({
    extended: true
  }))
  
app.set('view engine', 'ejs');
const userSchema = ({
  email: String,
  password: String
});

const User = new mongoose.model("User", userSchema);
 

app.get("/", function(req, res){
    res.render("home");
  });
  
  app.get("/login", function(req, res){
    res.render("login");
  });
  
  app.get("/register", function(req, res){
    res.render("register");
  });
  app.get("/", function(req, res){
    res.render("home");
  });
  
  app.get("/login", function(req, res){
    res.render("login");
  });
  
  app.get("/register", function(req, res){
    res.render("register");
  });

  app.post("/register", function(req, res){
    const newUser =  new User({
      email: req.body.username,
      password: req.body.password
    });
    newUser.save(function(err){
      if (err) {
        console.log(err);
      } else {
        res.render("index");
      }
    });
  });

  app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;
  
    User.findOne({email: username}, function(err, foundUser){
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === password) {
            res.render("index");
          }
        }
      }
    });
  });
  app.get("/index",function(req,res){

io.on('connection',(socket) =>{
    console.log('New websocket connection')
    socket.on('join',({username,room},callback)=>{

        const {error,user}= addUser({id:socket.id,username,room})

        if(error){
            return callback(error)
        }


          socket.join(user.room)

          socket.emit('message',generateMessage('Admin','Welcome'))
          socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))
            
          io.to(user.room).emit('roomData',{
              room:user.room,
              users:getUsersinRoom(user.room)
          })

          callback();
    })

    socket.on('message',(message,callback)=>{
          const user = getUser(socket.id)
        io.to(user.room).emit('message',generateMessage(user.username,message));
        callback('Delivered');
    })


    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        
        io.to(user.room).emit('sendLocation',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })



    socket.on('disconnect', ()=>{
           
        const user=removeUser(socket.id)

         if(user){
            
          io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the room`));
          io.to(user.room).emit('roomData',{
              room:user.room,
              users:getUsersinRoom(user.room)
          })
         }


    })
    
})
  });




server.listen(port,()=>{
    console.log('Server is up on 3000')   
    ;
})


const path = require('path')
const http = require('http')
const express = require('express')
const sockeio = require('socket.io')
const {generateMessage,generateLocationMessage,generateImageMessage,generateAudioMessage} =require('./utils/messages')
const {addUser,removeUser,getUser,getUsersinRoom} =require('./utils/users')

const app = express();
const server =http.createServer(app)
const io = sockeio(server);

const port = 3000;
const publicDirpath = path.join(__dirname,'../public')

app.use(express.static(publicDirpath))





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

    socket.on('sendImage',function(image,callback){
        const user= getUser(socket.id);

        io.to(user.room).emit('sendImage',generateImageMessage(user.username,image));
        callback();
    })

    socket.on('sendAudio',function(audio,callback){
        const user= getUser(socket.id);

        io.to(user.room).emit('sendAudio',generateAudioMessage(user.username,audio));
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



server.listen(port,()=>{
    console.log('Server is up on 3000')
    ;
})

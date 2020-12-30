
const socket =io();


//Elements

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.getElementById('message')
const $messageFormButton = document.getElementById('submitBtn');
const $imgbutton=document.getElementById('imgbutton');
const $sendImage=document.getElementById('sendImage');
const $recording=document.getElementById("recording");
const $audio=document.getElementById("audio");
const $locationBtn = document.querySelector('#location');
const $messages =document.querySelector('#messages');


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const imageTemplate = document.querySelector('#image-template').innerHTML;
const audioTemplate = document.querySelector('#audio-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoScroll =() =>{

    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the last message
    const newMessageStyles= getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight+newMessageMargin;


    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

     socket.on('message', (message)=>{

         const html = Mustache.render(messageTemplate,{
             username:message.username,
             message:message.text,
             createdAt:moment(message.createdAt).format('hh:mm A')
         })
         $messages.insertAdjacentHTML('beforeend',html)
         autoScroll()
     })

     socket.on('sendLocation',(location)=>{
        console.log(locationURL)
        const html = Mustache.render(locationTemplate,{
            username:location.username,
            locationURL:location.url,
            createdAt: moment(location.createdAt).format('hh:mm A')
        })
        $messages.insertAdjacentHTML('beforeend',html);
        autoScroll()
    })

    socket.on('sendImage',function(image){
        const html = Mustache.render(imageTemplate,{
            username:image.username,
            imageURL:image.image,
            createdAt: moment(image.createdAt).format('hh:mm A')
        })
        $messages.insertAdjacentHTML('beforeend',html);
        autoScroll()
    })

    socket.on('sendAudio',function(audioUrl){
       const html = Mustache.render(audioTemplate,{
           username:audioUrl.username,
           audioURL:audioUrl.audio,
           createdAt: moment(audioUrl.createdAt).format('hh:mm A')
       })
       $messages.insertAdjacentHTML('beforeend',html);
       autoScroll()
    })

socket.on('roomData',({room,users})=>{

   const html =Mustache.render(sidebarTemplate,{
       room,
       users
   })
   document.querySelector("#sidebar").innerHTML = html;
})


 $messageForm.addEventListener('submit',(e)=>{

    e.preventDefault();   // to prevent refreshing the browser

    //disable
    $messageFormButton.setAttribute('disabled','disabled');


     const message = document.getElementById('message').value;

     socket.emit('message',message,(message)=>{

           $messageFormButton.removeAttribute('disabled');
           $messageFormInput.value=''
           $messageFormInput.focus();

           //enable
         console.log('The message is delivered',message);
     });
 })


$locationBtn.addEventListener('click',()=>{

    if(navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    $locationBtn.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((position)=>{

        console.log(position);
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude:position.coordes.longitude
        },()=>{

            $locationBtn.removeAttribute('disabled')
            console.log("Location is shared");
        })
    })

})

$imgbutton.addEventListener('click',()=>{
  document.getElementById('sendImage').click();
})

$sendImage.addEventListener('change',function(){
  if(this.files.length!=0){

    var file=this.files[0];
    const  fileType = file['type'];
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    reader=new FileReader()
    if(!reader || !validImageTypes.includes(fileType) ){
      this.value='';
      return;
    };

    reader.onload=function(e){
      this.value='';
      const image=e.target.result;
      socket.emit('sendImage',image,(image)=>{
        console.log("image is delivered");
      });
    };

    reader.readAsDataURL(file);
  }
})

$recording.addEventListener("pointerdown",async()=>{
     recordedChunks = startRecording(stream)
}, false);

$recording.addEventListener("pointerup",async()=>{
  recorder.state == "recording" && recorder.stop()
   recordedChunks = await recordedChunks
   recordedBlob = new Blob(recordedChunks, {type: 'audio/ogg; codecs="opus"'});
   const audioUrl = URL.createObjectURL(recordedBlob);
   var audioFile = new File([recordedBlob], "audio.ogg", {
       type: 'audio/ogg; codecs="opus"',
   });
   reader=new FileReader()
   reader.onload=function(e){
     this.value='';
     const audioFile=e.target.result;
     socket.emit('sendAudio',audioFile,(audioFile)=>{
       console.log("Audio is delivered");
     });
   };
   reader.readAsDataURL(audioFile);
})

function playAudio(value) {
  const audio = new Audio(value);
  const play = () => {
               audio.play();
             };
  audio.play();
}

function pauseAudio(value) {
  const audio = new Audio(value);
  const play = () => {
               audio.pause();
             };
   audio.pause();
}
function startRecording(stream) {
    recorder = new MediaRecorder(stream);
    let data = [];
    recorder.ondataavailable = event => data.push(event.data);
    recorder.start();
    let stopped = new Promise((resolve, reject) => {
        recorder.onstop = resolve;
        recorder.onerror = event => reject(event.name);
    });

    return stopped.then(() => data);
}

let stream
( async () => {
    stream = await navigator.mediaDevices.getUserMedia({
         audio: true,
         video: false
    })
})();

socket.emit('join',{username,room},(error)=>{

     if(error){
        alert(error)
        location.href='/';
     }
});

const generateMessage =(username,text)=>{
    return {
        username,
        text,
        createdAt:new Date().getTime()
    }
}

const generateLocationMessage =(username,url)=>{
    return {
        username,
        url,
        createdAt:new Date().getTime()
    }
}

const generateImageMessage = (username,image)=>{
  return{
    username,
    image,
    createdAt:new Date().getTime()
  }
}

const generateAudioMessage = (username,audio)=>{
  return{
    username,
    audio,
    createdAt:new Date().getTime()
  }
}

module.exports ={
    generateMessage,
    generateLocationMessage,
    generateImageMessage,
    generateAudioMessage
}

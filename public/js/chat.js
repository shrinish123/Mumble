const socket = io();

//Elements

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.getElementById('message');
const $messageFormButton = document.getElementById('submitBtn');
const $locationBtn = document.querySelector('#location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the last message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('hh:mm A'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('sendLocation', (location) => {
  console.log(locationURL);
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    locationURL: location.url,
    createdAt: moment(location.createdAt).format('hh:mm A'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault(); // to prevent refreshing the browser

  //disable
  $messageFormButton.setAttribute('disabled', 'disabled');

  const message = document.getElementById('message').value;

  socket.emit('message', message, (message) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    //enable
    console.log('The message is delivered', message);
  });
});

$locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  $locationBtn.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coordes.longitude,
      },
      () => {
        $locationBtn.removeAttribute('disabled');
        console.log('Location is shared');
      },
    );
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

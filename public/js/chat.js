const socket = window.io();

const randomNickname = () => {
  let randomString = '';
  do { randomString += Math.random().toString(36).substr(2); } while (randomString.length < 16);
  randomString = randomString.substr(0, 16);
  
  return randomString;
};
// https://gist.github.com/6174/6062387

// Choose username:
const nicknameImput = document.getElementById('username');
const nickChangeBtn = document.getElementById('usernameBtn');
const userNickname = document.getElementById('userNickname');
const usersList = document.getElementById('usersList');

// const params = (new URL(document.location)).searchParams;

let nickname = randomNickname();

nickChangeBtn.addEventListener('click', () => {
  const oldNick = nickname;
  const newNick = nicknameImput.value;

  nickname = nicknameImput.value;
  userNickname.textContent = nickname;

  socket.emit('changeNicknames', { oldNick, newNick });
  nicknameImput.value = '';
});

const createNick = (nick, newNick) => {
  const li = document.createElement('li');
  li.textContent = nick;
  if (newNick === nickname) li.setAttribute('data-testid', 'online-user');
  usersList.appendChild(li);
};

const createArrayOfNicks = (array) => {
  usersList.innerHTML = '';
  array.forEach((nick) => createNick(nick, nickname));
};

// Chat messages:
const sendBtn = document.getElementById('sendBtn');
const inputMessage = document.getElementById('messageInput');

sendBtn.addEventListener('click', () => {
  socket.emit('message', {
    nickname,
    chatMessage: inputMessage.value,
  });

  inputMessage.value = '';
});

const createMessage = (message) => {
  const messagesUl = document.querySelector('#messages');
  const li = document.createElement('li');
  li.setAttribute('data-testid', 'message');
  li.innerText = message;
  messagesUl.appendChild(li);
};

socket.on('message', (recivedMessage) => createMessage(recivedMessage));

socket.on('updateNicknames', (nicknames) => {
  const nicknamesList = nicknames.filter((el) => el !== nickname);
  nicknamesList.unshift(nickname);
  createArrayOfNicks(nicknamesList);
  // https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift
});

const renderMessages = (messages) => {
  const txtMsg = messages.map((el) => `${el.timestamp} - ${el.nickname}: ${el.message}`);
  
  txtMsg.forEach((message) => createMessage(message));
};

const getPreviousMessages = async () => {
  fetch('http://localhost:3000/messages')
    .then((data) => data.json())
    .then((messages) => {
      renderMessages(messages);
    });
};

window.onload = async () => {
  await getPreviousMessages();
  userNickname.innerHTML = nickname;
  socket.emit('userLogin', nickname);
};

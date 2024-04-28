function log() {
  var login = document.getElementById('log').value;
  var pass = document.getElementById('pass').value;

  fetch('/loginUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ login, pass })
  })
    .then(response => response.text())
    .then(message => {
      if (message === 'Вход выполнен успешно') {
        window.location.replace('/profile.html');
      } else {
        alert(message);
      }
    })
    .catch(error => alert(error));
}

function reg() {
  let login = document.getElementById('log').value;
  let pass = document.getElementById('pass').value;
  let pass2 = document.getElementById('pass2').value;

  if (pass == pass2) {
    fetch('/registerUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ login, pass })
    })
      .then(response => response.text())
      .then(message => {
        if (message === 'Пользователь успешно зарегистрирован') {
          window.location.replace('/profile.html');
        } else {
          alert(message);
          window.location.replace('/reg.html');
        }
      })
      .catch(error => alert(error));
  }
  else{
    alert('Пароли не совпадают')
  }
}

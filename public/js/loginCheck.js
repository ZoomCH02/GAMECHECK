fetch('/checkLoggedIn')
    .then(response => {
        if (response.status === 200) {
            // Пользователь вошел в аккаунт
            console.log('Пользователь вошел в аккаунт');
            var loginButton = document.getElementById('loginButton')
            loginButton.innerText = `Профиль`
            loginButton.setAttribute('href', '/profile.html')
        } else {
            // Пользователь не вошел в аккаунт
            window.location.replace('./login.html')
            console.log('Пользователь не вошел в аккаунт');
        }
    })
    .catch(error => console.error('Ошибка:', error));

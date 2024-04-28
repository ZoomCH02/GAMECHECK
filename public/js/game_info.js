document.addEventListener('DOMContentLoaded', function () {
    // Получаем ID игры из URL
    const urlParams = window.location.search
    var gameId = urlParams.split('?')[1]

    // Запрос на сервер для получения информации об игре по её ID
    fetch(`/game/${gameId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(gameData => {
            // Отображаем информацию о игре на странице
            renderGame(gameData);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

});

function renderGame(gameData) {
    var title = document.querySelector('title')
    title.innerText = "GameCheck | " + gameData.name

    var img = document.getElementById('gameImg');
    var gameName = document.getElementById('gameName');

    var gamecard = document.getElementById('gamecard')
    gamecard.dataset.id = gameData.id

    img.setAttribute('src', `${gameData.img}`)
    gameName.innerText = gameData.name
}

function addGameToUser() {
    gameId = document.getElementById('gamecard').dataset.id
    // Подготовка данных для отправки
    const data = {
        game_id: gameId
    };

    // Опции запроса
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    // Отправка запроса на сервер
    fetch('/addGame', options)
        .then(response => {
            if (!response.ok) {
                if(response.status==400){
                    alert('Игра уже добавлена')
                }
                throw new Error('Ошибка при добавлении игры');
            }
            return response.text();
        })
        .then(message => {
            console.log(message); // Вывод сообщения об успешном добавлении игры
            window.location.replace('./profile.html')
        })
        .catch(error => {
            console.error('Произошла ошибка:', error.message); // Вывод сообщения об ошибке
        });
}



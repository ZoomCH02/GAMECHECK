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
    title.innerText = "GameCheck | "+gameData.name

    var img = document.getElementById('gameImg');
    var gameName = document.getElementById('gameName');

    img.setAttribute('src',`${gameData.img}`)
    gameName.innerText = gameData.name
}



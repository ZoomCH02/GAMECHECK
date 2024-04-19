var total = 0

function updateTotalRating(gameCard) {
    const ratingInputs = gameCard.querySelectorAll('.game-input[type="range"]');
    const totalRating = gameCard.querySelector('.total-rating');

    const ratings = Array.from(ratingInputs).map(input => parseInt(input.value));
    const weights = [1.5, 2.0, 1.2, 1.0];
    totalRating.textContent = `Общий рейтинг: ${total.toFixed(2)}`;
    total = ratings.reduce((acc, rating, index) => acc + rating * weights[index], 0);
}

function createGameCard(game) {
    total = game.rating

    const cardDiv = document.createElement('div');
    cardDiv.classList.add('row');
    cardDiv.innerHTML = `
        <div class="col-md-12">
            <div class="card mb-3 game-card" data-game="${game.game_name}" data-game-id="${game.game_id}">
                <div class="card-body d-flex align-items-start">
                    <div class="col-md-2 mb-3">
                        <img src="${game.img}" class="game-image">
                    </div>
                    <div class="col-md-10 text-left card game-details">
                        <div class="form-group">
                            <label for="input1">Сюжет</label>
                            <input type="range" class="form-control-range game-input" id="input1" min="1" max="10" data-category="plot" value="${game.plot_rating}">
                            <span class="input-value">${game.plot_rating}</span>
                        </div>
                        <div class="form-group">
                            <label for="input2">Геймплей</label>
                            <input type="range" class="form-control-range game-input" id="input2" min="1" max="10" data-category="gameplay" value="${game.gameplay_rating}">
                            <span class="input-value">${game.gameplay_rating}</span>
                        </div>
                        <div class="form-group">
                            <label for="input3">Атмосфера</label>
                            <input type="range" class="form-control-range game-input" id="input3" min="1" max="5" data-category="atmosphere" value="${game.atmosphere_rating}">
                            <span class="input-value">${game.atmosphere_rating}</span>
                        </div>
                        <div class="form-group">
                            <label for="input4">Графика</label>
                            <input type="range" class="form-control-range game-input" id="input4" min="1" max="5" data-category="graphic" value="${game.graphics_rating}">
                            <span class="input-value">${game.graphics_rating}</span>
                        </div>
                        <h2 class="total-rating">${game.rating}</h2>
                    </div>
                </div>
                <h1 class="game-title">${game.game_name}</h1>
                <a align="right" class="btn delBut">Удалить</a>
                <br>
            </div>
        </div>
    `;
    updateTotalRating(cardDiv.querySelector('.game-card'));
    const ratingInputs = cardDiv.querySelectorAll('.game-input[type="range"]');
    ratingInputs.forEach(input => {
        input.addEventListener('input', function () {
            const span = this.nextElementSibling;
            span.textContent = this.value;
            updateTotalRating(this.closest('.game-card'));
            const gameId = this.closest('.game-card').getAttribute('data-game-id');
            const newRatings = {
                plot_rating: parseInt(cardDiv.querySelector('#input1').value),
                gameplay_rating: parseInt(cardDiv.querySelector('#input2').value),
                atmosphere_rating: parseInt(cardDiv.querySelector('#input3').value),
                graphics_rating: parseInt(cardDiv.querySelector('#input4').value),
                rating: total
            };
            updateGameRating(gameId, newRatings);
        });
    });
    return cardDiv;
}

function updateGameRating(gameId, ratings) {
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ratings)
    };

    fetch(`/game/${gameId}/updateRating`, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при обновлении рейтинга игры');
            }
            return response.json();
        })
        .then(data => {
            const gameCard = document.querySelector(`.game-card[data-game-id="${gameId}"]`);
            if (gameCard) {
                const ratingElement = gameCard.querySelector('.total-rating');
                ratingElement.textContent = `Общий рейтинг: ${data.rating.toFixed(2)}`;
            } else {
                console.error('Карточка игры не найдена');
            }
        })
        .catch(error => {
            console.error('Ошибка при обновлении рейтинга игры:', error.message);
        });
}

window.onload = function () {
    const rootElement = document.getElementById('root');

    fetch('/user/games')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при получении данных игр пользователя');
            }
            return response.json();
        })
        .then(data => {
            var gamesCount = document.getElementById('gamesCount')
            gamesCount.innerHTML = `Пройдено игр: ${data.length}`

            data.forEach(game => {
                rootElement.appendChild(createGameCard(game));
            });
        })
        .catch(error => {
            console.error('Ошибка при получении данных игр пользователя:', error);
        });

    fetch('/user')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при получении данных пользователя');
            }
            return response.json();
        })
        .then(data => {
            console.log('ID пользователя:', data.id);
            console.log('Логин пользователя:', data.login);

            var userLogin = document.getElementById('userLogin')
            userLogin.innerText = data.login
        })
        .catch(error => {
            console.error('Ошибка:', error.message);
        });
};

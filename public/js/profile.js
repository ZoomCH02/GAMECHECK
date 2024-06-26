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
                        <h1 class="game-title">${game.game_name}</h1>
                        <p class="data_p">Дата прохождения: <span class="dateSpan">${game.date_of_add}</span> <img width="15px" style="margin-left: 5px; margin-bottom: 5px" src="/assets/edit.png" onclick="toggleDateEdit(this)"></p>
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
                <a align="right" onclick="deleteGame(${game.game_id})" class="btn delBut">Удалить</a>
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

function toggleDateEdit(imgElement) {
    const dateSpan = imgElement.previousElementSibling;
    const dateValue = dateSpan.textContent;
    if (dateSpan.tagName === 'SPAN') {
        // Скрываем кнопку изменения
        imgElement.style.display = 'none';

        const input = document.createElement('input');
        input.type = 'date';
        // Преобразуем значение даты в формат yyyy-mm-dd для input
        const dateParts = dateValue.split('.');
        const isoDate = dateParts[2] + '-' + dateParts[1].padStart(2, '0') + '-' + dateParts[0].padStart(2, '0');
        input.value = isoDate;
        input.classList.add('dateInput');

        const applyButton = document.createElement('button');
        applyButton.textContent = 'Применить';
        applyButton.classList.add('applyButton');
        applyButton.onclick = function () {
            const newDate = input.value;
            // Преобразуем значение даты в строку с форматом dd.mm.yyyy
            const parts = newDate.split('-');
            const formattedDate = parts[2] + '.' + parts[1] + '.' + parts[0];

            // Выполняем fetch запрос на сервер для обновления даты
            const playthroughId = imgElement.closest('.game-card').getAttribute('data-game-id');
            fetch(`/playthrough/${playthroughId}/updateDate`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ date_of_add: formattedDate })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка при обновлении даты прохождения игры');
                    }
                    window.location.reload()
                })
                .catch(error => {
                    console.error('Ошибка при обновлении даты прохождения игры:', error);
                });
        };

        dateSpan.parentNode.insertBefore(input, imgElement);
        dateSpan.parentNode.insertBefore(applyButton, imgElement);
        input.focus();
    } else {
        const span = document.createElement('span');
        span.textContent = dateValue;
        dateSpan.parentNode.replaceChild(span, dateSpan);
        const applyButton = document.querySelector('.applyButton');
        if (applyButton) {
            applyButton.remove();
        }
        // Показываем кнопку изменения после возвращения к текстовому формату
        imgElement.style.display = 'inline';
    }
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

function FindOnPage() {
    const input = inputField.value.trim();

    if (input.length < 3) {
        return;
    }

    fetch(`/games/${input}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const root = document.getElementById('modalBody');
            root.innerHTML = '';

            let hasGames = false; // Флаг, показывающий, есть ли игры в списке

            let rowHtml = '<div class="row justify-content-center align-items-stretch">';
            data.forEach((item, index) => {
                hasGames = true; // Помечаем, что есть игры в списке
                rowHtml += `
                    <div class="col-md-4 mb-1">
                        <div align="center">
                            <div class="card gamecard" style="background-color: #333; border-radius: 5%; height: 100%;">
                                <a href="/gamePage.html?${item.id}">
                                    <div style="height: 200px;"> <!-- Убираем стиль overflow и оставляем фиксированную высоту -->
                                        <br>
                                        <img src="${item.img}" style="border-radius: 5%; height: 100%; width: auto;"></img> <!-- Добавляем стиль width: auto; для сохранения пропорций изображения -->
                                    </div>
                                </a>
                                <div class="card-body" style="margin-top: 15px">
                                    <h3 class="card-title" style="color: #e1e3e6;">${item.name}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                if ((index + 1) % 3 === 0 || index === data.length - 1) {
                    rowHtml += '</div><br>';
                    root.innerHTML += rowHtml;
                    rowHtml = '<div class="row justify-content-center align-items-stretch">';
                }
            });

            if (!hasGames) {
                // Если в списке нет игр, добавляем кнопку "Добавить игру"
                root.innerHTML += `
                    <div class="col-md-12 text-center">
                        <h3>Мы сожалеем, но вашей игры нет в списке</h3>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function redirectToGameAddPage() {
    // Редирект на страницу добавления игры
    window.location.href = '/addGame.html';
}



function deleteGame(gameId) {
    fetch(`/user/games/${gameId}`, {
        method: 'DELETE',
        credentials: 'same-origin' // Для передачи куки с сессией
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при удалении игры');
            }
            return response.text();
        })
        .then(message => {
            console.log(message); // Выводим сообщение об успешном удалении
            window.location.reload()
        })
        .catch(error => {
            console.error('Ошибка при удалении игры:', error);
            // Здесь можно выполнить какие-то дополнительные действия в случае ошибки
        });
}

function handleAvatarUpload() {
    // Находим скрытый input для загрузки файла
    const avatarInput = document.getElementById('avatarInput');

    // Устанавливаем обработчик события изменения для input
    avatarInput.addEventListener('change', function () {
        // Получаем файл, выбранный пользователем
        const file = this.files[0];

        // Создаем объект FormData для отправки файла на сервер
        const formData = new FormData();
        formData.append('avatar', file); // Здесь 'avatar' - это имя, которое будет использоваться на сервере для получения файла

        // Отправляем запрос POST на сервер с помощью fetch
        fetch('/uploadAvatar', {
            method: 'POST',
            body: formData // Передаем объект FormData в теле запроса
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке файла');
                }
                return response.json();
            })
            .then(data => {
                // Обработка успешной загрузки файла, если нужно
                console.log('Файл успешно загружен:', data);
                window.location.reload();
            })
            .catch(error => {
                // Обработка ошибок загрузки файла
                console.error('Ошибка при загрузке файла:', error);
                window.location.reload();
            });
    });

    // Вызываем событие клика на скрытом input для запуска процесса выбора файла
    avatarInput.click();
}


// Получаем поле ввода
const inputField = document.getElementById('input');

// Добавляем обработчик события input
inputField.addEventListener('input', function () {
    const input = inputField.value.trim();
    if (input.length >= 3) {
        FindOnPage();
    } else {
        const root = document.getElementById('modalBody');
        root.innerHTML = ''; // Очищаем содержимое корневого элемента
    }
});

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
            // Преобразуем формат даты dd.mm.yyyy в объекты Date для сортировки
            data.forEach(game => {
                const dateParts = game.date_of_add.split('.');
                game.dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            });

            // Сортируем список игр по объектам Date в убывающем порядке
            data.sort((a, b) => b.dateObject - a.dateObject);

            // Группировка игр по годам
            const gamesByYear = {};
            data.forEach(game => {
                const year = game.dateObject.getFullYear();
                if (!gamesByYear[year]) {
                    gamesByYear[year] = [];
                }
                gamesByYear[year].push(game);
            });

            var gamesCount = document.getElementById('gamesCount');
            gamesCount.innerHTML = `Пройдено игр: ${data.length}`;

            // Вывод карточек игр по годам в убывающем порядке
            const years = Object.keys(gamesByYear).sort((a, b) => b - a);
            years.forEach(year => {
                const gamesOfYear = gamesByYear[year];
                const yearHeader = document.createElement('h2');
                yearHeader.textContent = year;
                yearHeader.setAttribute('align','center')
                rootElement.appendChild(yearHeader);
                gamesOfYear.forEach(game => {
                    rootElement.appendChild(createGameCard(game));
                });
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

            var userLogin = document.getElementById('userLogin');
            userLogin.innerText = data.login;
        })
        .catch(error => {
            console.error('Ошибка:', error.message);
        });
};


var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
    keyboard: false
});

document.getElementById('openModalBtn').addEventListener('click', function () {
    myModal.show();
});

document.querySelector('.modal-footer .btn-secondary').addEventListener('click', function () {
    myModal.hide();
});
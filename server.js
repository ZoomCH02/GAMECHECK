const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database('bd.db');

app.use(express.static(path.join(__dirname, 'public')));

/*
Общий рейтинг=(Оценка сюжета×Вес сюжета)+(Оценка геймплея×Вес геймплея)+(Оценка атмосферы×Вес атмосферы)+(Оценка графики×Вес графики)
*/

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.json());


app.post('/registerUser', (req, res) => {
  const { login, pass } = req.body;
  db.get('SELECT * FROM Users WHERE login = ?', [login], (err, row) => {
    if (err) {
      return res.status(500).send('Ошибка при выполнении запроса');
    }
    if (row) {
      return res.status(400).send('Пользователь уже существует');
    }
    db.run('INSERT INTO Users (login, pass) VALUES (?, ?)', [login, pass], (err) => {
      if (err) {
        return res.status(500).send('Ошибка при добавлении пользователя');
      }
      // После успешной регистрации входим в учетную запись пользователя
      req.session.user = { login }; // Сохраняем имя пользователя в сессии
      res.status(200).send('Пользователь успешно зарегистрирован и вошел в аккаунт');
    });
  });
});

app.post('/loginUser', (req, res) => {
  const { login, pass } = req.body;
  db.get('SELECT * FROM Users WHERE login = ? AND pass = ?', [login, pass], (err, row) => {
    if (err) {
      return res.status(500).send('Ошибка при выполнении запроса');
    }
    if (!row) {
      return res.status(400).send('Неверное имя пользователя или пароль');
    }
    // Сохраняем данные пользователя в сессии
    req.session.user = {
      id: row.id, // предположим, что у пользователя есть идентификатор
      login: row.login // предположим, что у пользователя есть имя пользователя
    };
    res.status(200).send('Вход выполнен успешно');
  });
});

// Серверный маршрут для обновления рейтинга игры
app.put('/game/:id/updateRating', (req, res) => {
  const gameId = req.params.id;
  const { plot_rating, gameplay_rating, atmosphere_rating, graphics_rating, rating } = req.body; // Предположим, что новые рейтинги передаются в теле запроса

  // Обновляем рейтинги игры в базе данных
  db.run('UPDATE Playthroughs SET plot_rating = ?, gameplay_rating = ?, atmosphere_rating = ?, graphics_rating = ?, rating = ? WHERE game_id = ?', 
         [plot_rating, gameplay_rating, atmosphere_rating, graphics_rating, rating, gameId], (err) => {
    if (err) {
      console.error('Ошибка при обновлении рейтингов игры:', err);
      return res.status(500).send('Ошибка при обновлении рейтингов игры');
    }
    // После успешного обновления рейтингов, возвращаем обновленные данные игры
    db.get('SELECT * FROM Playthroughs WHERE game_id = ?', [gameId], (err, gameData) => {
      if (err) {
        console.error('Ошибка при выполнении запроса:', err);
        return res.status(500).send('Ошибка при выполнении запроса');
      }
      if (!gameData) {
        return res.status(404).send('Игра не найдена');
      }
      res.json(gameData);
    });
  });
});



app.get('/game/:id', (req, res) => {
  const gameId = req.params.id;
  db.get('SELECT * FROM res WHERE id = ?', [gameId], (err, gameData) => {
    if (err) {
      console.error('Ошибка при выполнении запроса:', err);
      return res.status(500).send('Ошибка при выполнении запроса');
    }
    if (!gameData) {
      return res.status(404).send('Игра не найдена');
    }
    res.json(gameData);
  });
});

app.get('/user', (req, res) => {
  // Проверяем, вошел ли пользователь
  if (req.session.user) {
    // Если пользователь вошел, отправляем его id и login
    res.status(200).json({
      id: req.session.user.id,
      login: req.session.user.login
    });
  } else {
    // Если пользователь не вошел, отправляем сообщение об ошибке
    res.status(401).send('Пользователь не вошел в аккаунт');
  }
});

app.get('/user/games', (req, res) => {
  const userId = req.session.user.id; // Получаем ID пользователя из сессии

  // Запрос к базе данных для получения всех игр пользователя
  const sql = `
    SELECT Playthroughs.*, res.name AS game_name, res.img
    FROM Playthroughs
    INNER JOIN res ON Playthroughs.game_id = res.id
    WHERE Playthroughs.user_id = ?
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Ошибка при выполнении запроса:', err);
      return res.status(500).send('Ошибка при выполнении запроса');
    }
    res.json(rows); // Отправляем данные игр пользователя в формате JSON
  });
});


app.get('/games/:prefix', (req, res) => {
  const prefix = req.params.prefix;
  const sql = 'SELECT * FROM res WHERE name LIKE ?';
  db.all(sql, [prefix + '%'], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


app.get('/checkLoggedIn', (req, res) => {
  if (req.session.user) {
    // Пользователь вошел в аккаунт
    res.status(200).send('Пользователь вошел в аккаунт');
  } else {
    // Пользователь не вошел в аккаунт
    res.status(401).send('Пользователь не вошел в аккаунт');
  }
});


app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

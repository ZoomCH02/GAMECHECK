const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');


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


const uploadPath = path.join(__dirname, 'public/uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Генерация уникального имени файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Создание middleware для загрузки файла с помощью multer
const upload = multer({ storage: storage });

// Маршрут для изменения аватарки пользователя
app.post('/uploadAvatar', upload.single('avatar'), (req, res) => {
  // Проверка, вошел ли пользователь в систему
  if (!req.session.user) {
    return res.status(401).send('Пользователь не вошел в систему');
  }

  // Получение имени файла с его расширением из полного пути
  const fileName = req.file ? path.basename(req.file.path) : null;

  // Получение ID пользователя из сессии
  const userId = req.session.user.id;

  // Выполнение SQL-запроса для обновления записи пользователя с новым именем файла аватарки
  const sql = `
    UPDATE Users
    SET avatar = ?
    WHERE id = ?
  `;
  db.run(sql, [fileName, userId], (err) => {
    if (err) {
      console.error('Ошибка при обновлении аватарки пользователя:', err);
      return res.status(500).send('Ошибка при обновлении аватарки пользователя');
    }
    // Возвращаем сообщение об успешном изменении аватарки
    res.status(200).send('Аватарка пользователя успешно изменена');
  });
});




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

app.post('/addGame', (req, res) => {
  // Проверка, вошел ли пользователь в систему
  if (!req.session.user) {
    return res.status(401).send('Пользователь не вошел в систему');
  }

  // Извлечение данных из тела запроса
  const { game_id } = req.body;

  // Получение ID пользователя из сессии
  const user_id = req.session.user.id;

  const currentDate = new Date();

  // Получение дня, месяца и года
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Месяц начинается с 0
  const year = currentDate.getFullYear();

  // Формирование строки в нужном формате
  const formattedDate = `${day}.${month}.${year}`;

  // Подготовка и выполнение SQL запроса для добавления игры в базу данных
  const sql = `
    INSERT INTO Playthroughs (user_id, game_id, rating, graphics_rating, plot_rating, atmosphere_rating, gameplay_rating, play_count, date_of_add)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [user_id, game_id, 0, 0, 0, 0, 0, 1, formattedDate], (err) => {
    if (err) {
      console.error('Ошибка при добавлении игры в базу данных:', err);
      return res.status(500).send('Ошибка при добавлении игры в базу данных');
    }
    res.status(200).send('Игра успешно добавлена в базу данных');
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
    db.all('SELECT avatar FROM Users WHERE id=?', [req.session.user.id], (err, row) => {
      if (err) {
        console.log(err)
      }
      else {
        res.status(200).json({
          id: req.session.user.id,
          login: req.session.user.login,
          avatar: row[0].avatar
        });
      }
    })
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

app.delete('/user/games/:gameId', (req, res) => {
  // Проверка, вошел ли пользователь в систему
  if (!req.session.user) {
    return res.status(401).send('Пользователь не вошел в систему');
  }

  // Получение ID игры из параметров маршрута
  const gameId = req.params.gameId;

  // Получение ID пользователя из сессии
  const userId = req.session.user.id;

  // Подготовка и выполнение SQL запроса для удаления игры из базы данных
  const sql = 'DELETE FROM Playthroughs WHERE game_id = ? AND user_id = ?';
  db.run(sql, [gameId, userId], (err) => {
    if (err) {
      console.error('Ошибка при удалении игры из базы данных:', err);
      return res.status(500).send('Ошибка при удалении игры из базы данных');
    }
    res.status(200).send('Игра успешно удалена из базы данных');
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

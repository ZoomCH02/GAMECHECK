// Получаем поле ввода
const inputField = document.getElementById('input');

// Добавляем обработчик события input
inputField.addEventListener('input', function() {
  const input = inputField.value.trim();
  if (input.length >= 3) {
    FindOnPage();
  } else {
    const root = document.getElementById('root');
    root.innerHTML = ''; // Очищаем содержимое корневого элемента
  }
});

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
      const root = document.getElementById('root');
      root.innerHTML = '';
      let rowHtml = '<div class="row">';
      data.forEach((item, index) => {
        rowHtml += `
          <div class="col-md-4 mb-3">
            <div align="center">
              <div class="card" style="background-color: #333; border-radius: 5%; height: 100%;">
                <a href="/gamePage.html?${item.id}"> <!-- Изменяем ссылку на страницу с игрой -->
                  <div>
                    <br>
                    <img src="${item.img}" style="border-radius: 5%;"></img>
                  </div>
                </a>
                <div class="card-body">
                  <h3 class="card-title" style="color: #e1e3e6;">${item.name}</h3>
                </div>
              </div>
            </div>
          </div>
        `;
        if ((index + 1) % 3 === 0 || index === data.length - 1) {
          rowHtml += '</div>';
          root.innerHTML += rowHtml;
          rowHtml = '<div class="row">';
        }
      });
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}
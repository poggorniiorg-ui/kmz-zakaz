КМЗ №1 — сайт заказов, версия 3.0.7 (сборка под GitHub Pages)

ЧТО ВНУТРИ
  index.html          всё приложение одним файлом (весь JS внутри)
  compat.html         резервная страница, та же сборка
  404.html            копия index — чтобы любой неверный адрес открывал каталог
  manifest.json       для «добавить на главный экран»
  catalog-update.json обновление списка товаров
  icons/              иконки
  .nojekyll           отключает обработку Jekyll на GitHub

КАК ВЫЛОЖИТЬ
1. github.com -> New repository -> имя kmz-zakaz -> Public -> Create
2. Add file -> Upload files -> перетащить ВСЁ содержимое этой папки
   (сами файлы и папку icons, не саму папку целиком) -> Commit changes
3. Settings -> Pages -> Source: Deploy from a branch
   Branch: main, папка / (root) -> Save
4. Через 1-2 минуты адрес: https://ЛОГИН.github.io/kmz-zakaz/
   Слэш в конце обязателен.

ПРАВКИ
Открыть index.html Блокнотом, найти через Ctrl+F:
  СПИСОК ТОВАРОВ   каталог
  APP_VERSION      номер версии
Залить обратно: в репозитории нажать на index.html -> карандаш -> вставить -> Commit.

ЕСЛИ ПОСЛЕ ОБНОВЛЕНИЯ ТЕЛЕФОН ПОКАЗЫВАЕТ СТАРОЕ
Открыть адрес с добавкой ?v=8 в конце.

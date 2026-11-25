#!/bin/sh
# Собирает веб-демо и выкладывает на GitHub Pages (ветка gh-pages).
# Запуск: ./deploy-web.sh git@github.com:Ukhanov-Alexandr/ash-app-demo.git
# Имя репозитория должно совпадать с experiments.baseUrl в app.json (/ash-app-demo).
set -e
cd "$(dirname "$0")"

rm -rf dist
npx expo export --platform web

cd dist
# Демо не должно попадать в поиск: заказы из него никуда не уходят.
sed -i '' 's|<head>|<head><meta name="robots" content="noindex,nofollow">|' index.html
cp index.html 404.html # одностраничное приложение: любой адрес отдаёт его же
touch .nojekyll        # иначе GitHub Pages не отдаст папку _expo

[ -z "$1" ] && { echo "Собрано в dist/. Для выкладки укажите адрес репозитория."; exit 0; }
login=$(echo "$1" | sed -E 's|.*[:/]([^/]+)/[^/]+$|\1|')
git init -q -b gh-pages
git add -A
git -c user.name="$login" -c user.email="$login@users.noreply.github.com" commit -q -m "Веб-демо" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -f "$1" gh-pages

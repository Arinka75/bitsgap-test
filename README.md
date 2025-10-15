# bitsgap-test
# Bitsgap QA Automation Test

## 📋 Описание
Проект включает в себя комплексный тест, который проверяет полный цикл торговой операции:

логин в систему

Настройка демо-режима

Выбор типа ордера (Limit)

Установка параметров ордера 

Размещение ордера через интерфейс

## 🛠 Технологии
Playwright - фреймворк для автоматизации тестирования

TypeScript - язык программирования

## ⚙️ Установка и настройка
Клонирование репозитория:

git clone https://github.com/Arinka75/bitsgap-test.git
cd bitsgap-test

Установка зависимостей

npm install

Установка Playwright браузеров

npx playwright install

## 🚀 Как запускать

Запуск всех тестов

npm test

Запуск в отладочном режиме

npx playwright test --debug

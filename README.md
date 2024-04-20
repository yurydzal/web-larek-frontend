# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Архитектура проекта

### Основные типы данных

```mermaid
classDiagram
    CategotyMapping --> CategoryCssClass
    CategotyMapping --> ProductCategory
    IProductItem --> ProductCategory
    IBasketItem --> IProductItem
    IAppState --> IProductItem
    IAppState --> IBasketItem
    IAppState --> IOrder
    IOrderForm --> IOrder
    IOrder --> PaymentOption
    class ProductCategory {
        хард-скил
        софт-скил
        дополнительное
        кнопка
        другое
    }
    class CategoryCssClass {
        card__category_hard
        card__category_soft
        card__category_additional
        card__category_button
        card__category_other
    }
    class CategotyMapping {
        key: ProductCategory
        value: CategoryCssClass
    }
    class IProductItem {
        id: string
        description: string
        image: string
        title: string
        category: ProductCategory
        price: number | null
        inbasket: boolean
    }
    class IBasketItem {
        id: string
        title: string
        price: number | null
    }
    class IAppState {
        catalog: IProductItem[]
        basket: string[]
        preview: string | null
        order: IOrder | null
        addToBasket(id: string) void
        removeFromBasket(id: string) void
        clearBasket() void
        getTotal() number
        setCatalog(items: IProductItem[]) void
        setPreview(item: IProductItem) void
        setOrderField(field: keyof IOrderForm, value: string) void
        validateOrder() boolean
    }
    class PaymentOption {
        online
        receipt
    }
    class IOrderForm {
        address: string
        email: string
        phone: string
    }
    class IOrder {
        payment: PaymentOption
        total: number
        items: string[]
    }
    class FormErrors {
    }
    class IOrderResult {
        id: string
    }
```

### Базовый код
### View
### Model
### Сервисный класс
### Presenter
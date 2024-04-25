# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

**Структура проекта:**

* /src/ — исходные файлы проекта
* /src/components/ — папка с JS компонентами
* /src/components/base/ — папка с базовым кодом

**Основные файлы проекта:**

* src/pages/index.html — HTML-файл главной страницы
* src/types/index.ts — файл с типами
* src/index.ts — точка входа приложения
* src/styles/styles.scss — корневой файл стилей
* src/utils/constants.ts — файл с константами
* src/utils/utils.ts — файл с утилитами

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

Проект реализован по шаблону MVP (Model-View-Presenter)

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
        card | cash
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

``` typescript

// тип описывает категории которые могут быть присвоены продукту
type ProductCategory = 'хард-скил' |
    'софт-скил' |
    'дополнительное' |
    'кнопка' |
    'другое';

// тип описывает классы соответствующих категорий в таблице стилей
type CategoryCssClass = 'card__category_hard' |
    'card__category_soft' |
    'card__category_additional' |
    'card__category_button' |
    'card__category_other';

// тип описывает объединение двух литеральные типов в массив объектов,
// в которм пара "ключ : значение" представляют собой значения
// из этих литеральных типов
type CategotyMapping = {
    [K in ProductCategory]: { key: K; value: CategoryCssClass }
}[ProductCategory];

const ProductCategoryMap: CategotyMapping[] = [
    { key: 'хард-скил', value: 'card__category_hard' },
    { key: 'софт-скил', value: 'card__category_soft' },
    { key: 'дополнительное', value: 'card__category_additional' },
    { key: 'кнопка', value: 'card__category_button' },
    { key: 'другое', value: 'card__category_other' },
];

// интерфейс описывающий каждый продукт из каталога
interface IProductItem {
    id: string; // уникальный индификатор продукта
	description: string; // описание продукта
	image: string; // иллюстрация продукта
	title: string; // название продукта
	category: ProductCategory; // категория продукта
	price: number | null; // цена продукта
    inbasket: boolean; // определяет добавлен ли продукт в корзину
}

// тип описывает продукт находящийся в корзине
type IBasketItem = Pick<IProductItem, 'id' | 'title' | 'price'>;

// интерфейс описывает состояние самого приложения
interface IAppState {
    catalog: IProductItem[]; // массив продуктов в каталоге
    basket: IBasketItem[]; // массив продуктов в корзине
    preview: string | null; // превтю карточки продукта
    order: IOrder | null; // параметры заказа
    addToBasket(id: string): void; // метод добавления продукта в корзину
    removeFromBasket(id: string): void; // метод удаления продукта из корзины
    clearBasket(): void; // метод полной очистки корзины
    getTotal(): number; // метод получения общей стоимости корзины
    setCatalog(items: IProductItem[]): void; // метод обработки данных продуктов
    setPreview(item: IProductItem): void; // метод отображения превью продукта
    setOrderField(field: keyof IOrderForm, value: string): void; // метод заполнения форм при заказе
    validateOrder(): boolean; // метод валидации форм при оформлении заказа
}

// тип описывает возможные варианты оплаты заказа
type PaymentOption = 'card' | 'cash';

// интерфейс описывает заполняемые поля формы в заказе
interface IOrderForm {
    address: string; // поле для ввода адреса
    email: string; // поле для ввода электронной почты
    phone: string; // поле для ввода телефона
}

// интерфейс описывает параметры заказа
interface IOrder extends IOrderForm {
    payment: PaymentOption; // выбор способа оплаты заказа
    total: number; // итоговая стоимость заказа
    items: string[]; // массив продуктов в заказе
}

// тип описывает ошибки в полях формы заказа
type FormErrors = Partial<Record<keyof IOrder, string>>;

// интерфейс описывает успешное исполение заказа
interface IOrderResult {
    id: string; // строка успешного исполения заказа
}

```

### Базовый код

```typescript

/**
 * Базовый компонент
 */
abstract class Component<T> {
    protected constructor(protected readonly container: HTMLElement) {}

    // Инструментарий для работы с DOM в дочерних компонентах

    // Переключить класс
    toggleClass(element: HTMLElement, className: string, force?: boolean) {}

    // Установить текстовое содержимое
    protected setText(element: HTMLElement, value: unknown) {}

    // Сменить статус блокировки
    setDisabled(element: HTMLElement, state: boolean) {}

    // Скрыть
    protected setHidden(element: HTMLElement) {}

    // Показать
    protected setVisible(element: HTMLElement) {}

    // Установить изображение с алтернативным текстом
    protected setImage(element: HTMLImageElement, src: string, alt?: string) {}

    // Вернуть корневой DOM-элемент
    render(data?: Partial<T>): HTMLElement {}
}


/**
 * Базовая модель, чтобы можно было отличить ее от простых объектов с данными
 */
abstract class Model<T> {

    // Принять данные и ивент
    constructor(data: Partial<T>, protected events: IEvents) {}

    // Сообщить всем что модель поменялась
    emitChanges(event: string, payload?: object) {}
}


/**
 * Брокер событий, классическая реализация
 * позволяет подписываться на события
 * и передавать информацию всем подписчикам
 */
export class EventEmitter implements IEvents {
    _events: Map<EventName, Set<Subscriber>>;

    // Принимает имя жвента и подписчика
    constructor() {
        this._events = new Map<EventName, Set<Subscriber>>();
    }

    //Установить обработчик на событие
    on<T extends object>(eventName: EventName, callback: (event: T) => void) {}

    //Снять обработчик с события
    off(eventName: EventName, callback: Subscriber) {}

    //Инициировать событие с данными
    emit<T extends object>(eventName: string, data?: T) {}

    //Слушать все события
    onAll(callback: (event: EmitterEvent) => void) {}

    //Сбросить все обработчики
    offAll() {}

    //Сделать коллбек триггер, генерирующий событие при вызове
    trigger<T extends object>(eventName: string, context?: Partial<T>) {}
}


/**
 * Класс API для взаимодействия с сервером
 */
class Api {
    readonly baseUrl: string;
    protected options: RequestInit;

    // Принимает основную url ссылку и параметры запроса
    constructor(baseUrl: string, options: RequestInit = {}) {}

    // Возвращает ответ от сервера или ошибку
    protected handleResponse(response: Response): Promise<object> {}

    // Получает данные с сервера
    get(uri: string) {}

    // Отправляет данные на сервер
    post(uri: string, data: object, method: ApiPostMethods = 'POST') {}
}

```

### Model

```typescript

/**
 * Класс для работы с данными компонентов
 */
class AppState extends Model<IAppState> {

    // Добавляет в корзину
    addToBasket(id: string) {}

    // Удаляет из корзины
    removeFromBasket(id: string) {}

    // Очищает корзину
    clearBasket() {}

    // Заполняет заказ выбранными товарами
    fillOrder() {}

    // Получает сумму заказа в корзине
    getTotal() {}

    // Заполняет католог продуктов
    setCatalog(items: IProductItem[]) {}

    // Устанавливает превью продукта
    setPreview(item: ProductItem) {}

    // Выдаёт массив товаров из корзине
    getProducts(): ProductItem[] {}

    // Добавляет метод оплаты
    setPaymentOption(value: PaymentOption) {}

    // Если форма заказа прошла проверку заполняет заказ
    setOrderField(field: keyof IOrderForm, value: string) {}

    // Если форма контактных данных прошла проверку заполняет заказ
    setContactsField(field: keyof IOrderForm, value: string) {}

    // Проверка заказа на наличие ошибок
    validateOrder() {}
}

```

### View

```typescript

/**
 * Класс главной страницы
 */
class Page extends Component<IPage> {

    // Элементы страницы
    protected _counter: HTMLElement;
    protected _gallery: HTMLElement;
    protected _wrapper: HTMLElement;
    protected _basket: HTMLElement;

    // Принимает элемент и обработчик событий
    constructor(container: HTMLElement, protected events: IEvents) {}

    // Сеттер счётчика товаров
    set counter(value: number) {}

    // Сеттер каталога товаров
    set catalog(items: HTMLElement[]) {}

    // Сеттер блока прокрутки
    set locked(value: boolean) {}
}

/**
 * Класс карточки продукта
 */
class Card extends Component<ICard> {

    // Элементы продукта
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _button?: HTMLButtonElement;
    protected _price?: HTMLElement;
    protected _category?: HTMLElement;

    /**
    * Принимает:
    * - имя блока
    * - родительский элемент
    * - колбэк функции
    */
    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {}

    // Сеттер уникальго индификатора продукта
    set id(value: string) {}
    // Геттер уникальго индификатора продукта
    get id(): string {}

    // Сеттер названия продукта
    set title(value: string) {}
    // Геттер названия продукта
    get title(): string {}

    // Сеттер изображения продукта
    set image(value: string) {}

    // Сеттер описания продукта
    set description(value: string) {}

    // Сеттер цены продукта
    set price(value: number | null) {}
    // Геттер цены продукта
	get price(): number {}

    // Сеттер наличия продукта в корзине
    set inbasket(value: boolean) {}

    // Сеттер категории продукта
    set category(category: ProductCategory) {}
}

/**
 * Класс модального окна
 */
class Modal extends Component<IModalData> {

    // Элементы окна
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;

    // Принимает родительский элемент и колбэк функции
    constructor(container: HTMLElement, protected events: IEvents) {}

    // Сеттер содержимого
    set content(value: HTMLElement) {
        this._content.replaceChildren(value);
    }

    // Метод открытия
    open() {}

    // Метод закрытия
    close() {}

    // Метод отрисовки
    render(data: IModalData): HTMLElement {}
}

/**
 * Класс корзины
 */
class Basket extends Component<IBasketView> {

    // Элементы корзины
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLElement;

    // Принимает родительский элемент и колбэк функции
    constructor(container: HTMLElement, protected events: EventEmitter) {}

    // Сеттер элементов корзины
    set items(items: HTMLElement[]) {}

    // Сеттер общей суммы заказа
    set total(total: number) {
        this.setText(this._total, formatNumber(total));
    }
}

/**
 * Класс элемента корзины
 */
class ProductInBasket extends Component<IBasketCard> {

    // Элементы
	protected _index: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLButtonElement;

    // Принимает родительский элемент и колбэк функции
    constructor(container: HTMLElement, actions?: IBasketActions) {}

    // Сеттер названия
    set title(value: string) {}

    // Сеттер индекса
    set index(value: number) {}

    // Сеттер цены
    set price(value: number) {}
}

/**
 * Класс формы заказа продукта
 */
class Order extends Form<IOrderForm> {

    // Метод бовления класса кнопке
    setButtonClass(name: string): void {}

    // Принимает родительский элемент и колбэк функции
    constructor(container: HTMLFormElement, events: IEvents) {}

    // Сеттер адресса
    set address(value: string) {}
}

/**
 * Класс формы контактных данных
 */
class Contacts extends Form<IOrder> {

    // Принимает родительский элемент и колбэк функции
    constructor(container: HTMLFormElement, events: IEvents) {}

    // Сеттер электронной почты
    set email(value: string) {}

    // Сеттер номера телефона
    set phone(value: string) {}
}

/**
 * Класс формы продукта
 */
class Form<T> extends Component<IFormState> {

    // Элементы формы
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    // Принимает родительский элемент и колбэк функции
    constructor(protected container: HTMLFormElement, protected events: IEvents) {}

    // Метод изменения состояния поля
    protected onInputChange(field: keyof T, value: string) {}

    // Сеттер успешно введенных данных
    set valid(value: boolean) {}

    // Сеттер ошибок
    set errors(value: string) {}

    // Метод отрисовки ошибок
    render(state: Partial<T> & IFormState) {}
}

/**
 * Успешного оформления заказа
 */
class Success extends Component<ISuccess> {

    // Элементы успешного оформления заказа
    protected _close: HTMLElement;
    protected _total: HTMLElement;

    // Принимает родительский элемент и колбэк функции
    constructor(container: HTMLElement, actions: ISuccessActions, data: number) {}
}

```

### Presenter

* **items:changed** - Изменились элементы каталога
* **card:select** - Открыть карточку продукта
* **preview:changed** - Изменен открытый выбранный продукт
* **basket:open** - Открытие корзины
* **basket:add** - Добавление в корзину
* **basket:remove** - Удаление из корзины
* **basket:changed** - Изменения в корзине
* **order:open** - Открытие формы заказа
* **order:submit** - Переход к форме контактов
* **contacts:submit** - Переход успешному оформлению заказа
* **formErrors:change** - Изменилось состояние валидации формы
* **payment:changed** - Изменение способа оплаты
* **modal:open** - Блокируем прокрутку страницы если открыта модалка
* **modal:close** - Разблокируем прокрутку страницы если модалка закрыта

### Сервисные классы

```typescript

/**
 * Сервисный класс упрощающий работу с API
 */
class ProductAPI extends Api implements IProductAPI {
    readonly cdn: string;

    /**
    * Принимает:
    * - ссылку на каталог с изображениями
    * - основную url ссылку
    * - параметры запроса
    */
    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    // Получает все продукты
    getProductList(): Promise<IProductItem[]> {}

    // Получает определённый продукт
    getProductItem(id: string): Promise<IProductItem> {}

    // Отправляет заказ на сервер
    orderProducts(order: IOrder): Promise<IOrderResult> {}
}

```

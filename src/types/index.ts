import { ProductAPI } from "../components/ProductAPI";

// тип описывает категории которые могут быть присвоены продукту
export type ProductCategory = 'хард-скил' | 'софт-скил' | 'дополнительное' | 'кнопка' | 'другое';

// тип описывает классы соответствующих категорий в таблице стилей
export type CategoryCssClass = 'card__category_hard' | 'card__category_soft' | 'card__category_additional' | 'card__category_button' | 'card__category_other';

// тип описывает объединение двух литеральные типов в массив объектов,
// в которм пара "ключ : значение" представляют собой значения
// из этих литеральных типов
export type CategotyMapping = {
    [K in ProductCategory]: { key: K; value: CategoryCssClass }
}[ProductCategory];

// интерфейс описывающий каждый продукт из каталога
export interface IProductItem {
    id: string; // уникальный индификатор продукта
	description: string; // описание продукта
	image: string; // иллюстрация продукта
	title: string; // название продукта
	category: ProductCategory; // категория продукта
	price: number | null; // цена продукта
    inbasket: boolean; // определяет добавлен ли продукт в корзину
}

// тип описывает продукт находящийся в корзине
export type IBasketItem = Pick<IProductItem, 'id' | 'title' | 'price'>;

// интерфейс описывает состояние самого приложения
export interface IAppState {
    catalog: IProductItem[]; // массив продуктов в каталоге
    basket: IBasketItem[]; // массив продуктов в корзине
    preview: string | null; // превтю карточки продукта
    order: IOrder | null; // параметры заказа
}

// тип описывает возможные варианты оплаты заказа
export type PaymentOption = 'card' | 'cash';

// интерфейс описывает заполняемые поля формы в заказе
export interface IOrderForm {
    address: string; // поле для ввода адреса
    email: string; // поле для ввода электронной почты
    phone: string; // поле для ввода телефона
}

// интерфейс описывает параметры заказа
export interface IOrder extends IOrderForm {
    payment: PaymentOption; // выбор способа оплаты заказа
    total: number; // итоговая стоимость заказа
    items: string[]; // массив продуктов в заказе
}

// тип описывает ошибки в полях формы заказа
export type FormErrors = Partial<Record<keyof IOrder, string>>;

// интерфейс описывает успешное исполение заказа
export interface IOrderResult {
    id: string; // строка успешного исполения заказа
}
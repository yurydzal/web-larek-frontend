import './scss/styles.scss';

import { ProductAPI } from './components/ProductAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppState, CatalogChangeEvent } from "./components/AppData";
import { Page } from "./components/Page";
import { Card } from "./components/Card";
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from "./components/common/Modal";
import { Basket, ProductInBasket } from "./components/common/Basket";
import { IOrderForm, IOrder, IProductItem, PaymentOption } from "./types";
import { Order, Contacts } from "./components/Order";
import { Success } from "./components/common/Success";

const events = new EventEmitter();
const api = new ProductAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            id: item.id,
            title: item.title,
            image: item.image,
            description: item.description,
            category: item.category,
            price: item.price,
        });
    });
});

// Открыть карточку продукта
events.on('card:select', (item: IProductItem) => {
    appData.setPreview(item);
});

// Изменен открытый выбранный продукт
events.on('preview:changed', (item: IProductItem) => {
    const showItem = (item: IProductItem) => {
        const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
            onClick: () => events.emit('basket:add', item)
        })
        modal.render({
            content: card.render({
                id: item.id,
                title: item.title,
                image: item.image,
                description: item.description,
                category: item.category,
                price: item.price,
                inbasket: item.inbasket,
            })
        });
    };

    if (item) {
        api.getProductItem(item.id)
            .then((result) => {
                item.description = result.description;
                showItem(item);
            })
            .catch((err) => {
                console.error(err);
            })
    } else {
        modal.close();
    }
});

// Добавление в корзину
events.on('basket:add', (item: IProductItem) => {
    item.inbasket = true;
    appData.addToBasket(item);
    modal.close();
})

// Удаление из корзины
events.on('basket:remove', (item: IProductItem) => {
    item.inbasket = false;
    appData.removeFromBasket(item);
})

// Открытие корзины
events.on('basket:open', () => {
	return modal.render({
		content: basket.render({}),
	});
});

// Изменения в корзине
events.on('basket:changed', () => {
	const basketItems = appData.basket.map((item, index) => {
		const productItem = new ProductInBasket(cloneTemplate(cardBasketTemplate), {
			onClick: () => events.emit('basket:remove', item),
		});
		return productItem.render({
			title: item.title,
			price: item.price,
			index: index + 1,
		});
	});
	const total = appData.getTotal();
	basket.render({
		items: basketItems,
		total: total || 0,
	});
    page.counter = appData.basket.length;
});

// Открытие формы заказа
events.on('order:open', () => {
	appData.validateOrder();
	modal.render({
		content: order.render({
            payment: null,
			address: appData.order.address,
			valid: appData.validateOrder(),
			errors: [],
		}),
	});
    // Установить значение оплаты 'Онлайн' по умолчанию
    appData.setPaymentOption('card');
    order.setButtonClass('card');
});

// Переход к форме контактов
events.on('order:submit', () => {
	appData.validateContacts();
	modal.render({
		content: contacts.render({
            email: appData.order.email,
            phone: appData.order.phone,
			valid: appData.validateContacts(),
			errors: [],
		}),
	});
});

// Переход успешному оформлению заказа
events.on('contacts:submit', () => {
    appData.fillOrder();
    appData.order.total = appData.getTotal();
    api.orderProducts(appData.order)
    .then((result) => {
        const success = new Success(cloneTemplate(successTemplate), {
            onClick: () => {
                modal.close();
                appData.clearBasket();
            }
        }, appData.order.total);
        modal.render({
            content: success.render({})
        });
        appData.clearBasket();
    })
    .catch(err => {
        console.error(err);
    });
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrder>) => {
    const { payment, address, email, phone } = errors;
    order.valid = !payment && !address;
    contacts.valid = !email && !phone;
    order.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
    contacts.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});
events.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm; value: string }) => {
	appData.setContactsField(data.field, data.value);
	}
);

// Изменение способа оплаты
events.on('payment:changed', (data: {target: PaymentOption}) => {
	appData.setPaymentOption(data.target);
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
    page.locked = false;
});

// Получаем лоты с сервера
api.getProductList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });
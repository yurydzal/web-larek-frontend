import _, { forEach } from "lodash";

import { Model } from "./base/Model";
import { FormErrors, IAppState, IBasketItem, IProductItem, ProductCategory, IOrder, PaymentOption, IOrderForm } from "../types";

export type CatalogChangeEvent = {
    catalog: ProductItem[]
};

export class ProductItem extends Model<IProductItem> {
    id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
    inbasket: boolean;
}

export class AppState extends Model<IAppState> {
    catalog: ProductItem[];
    basket: IBasketItem[] = [];
    preview: string | null;
    order: IOrder = {
        address: '',
        email: '',
        phone: '',
        payment: null,
        total: 0,
        items: []
    }
    formErrors: FormErrors = {};

    addToBasket(item: ProductItem) {
        this.basket.push(item);
    }

    removeFromBasket(item: ProductItem) {
        this.basket = this.basket.filter((element) => element.id != item.id);
    }

    clearBasket() {
        this.basket = [];
        this.order = {
            address: '',
            email: '',
            phone: '',
            payment: null,
            total: 0,
            items: []
        };
    }

    fillOrder() {
        this.order.items = [...new Set(this.basket.map((item) => item.id))];
    }

    getTotal() {
        return this.basket.reduce((sum, item) => sum + item.price, 0);
    }

    setCatalog(items: IProductItem[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: ProductItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    getProducts(): ProductItem[] {
        return this.catalog
            .filter(item => item.inbasket === true)
    }

    setPaymentOption(value: PaymentOption) {
        this.order.payment = value;
        this.validateOrder();
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;
        this.validateOrder();
    }

    setContactsField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;
        this.validateContacts();
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if(!this.order.payment) {
            errors.payment = 'Необходимо указать метод оплаты';
        }
        if(!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    validateContacts() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}
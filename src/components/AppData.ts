import _ from "lodash";

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
    category: ProductCategory;
    price: number;
}

export class AppState extends Model<IAppState> {
    catalog: ProductItem[];
    basket: string[];
    preview: string | null;
    order: IOrder = {
        address: '',
        email: '',
        phone: '',
        payment: 'online', //или поставить null чтобы значения по молчанию не было
        total: 0,
        items: []
    }
    formErrors: FormErrors = {};

    addToBasket(id: string) {
        this.order.items = _.uniq([...this.order.items, id]);
    }

    removeFromBasket(id: string) {
        this.order.items = _.without(this.order.items, id);
    }

    clearBasket() {
        this.order.items = [];
    }

    getTotal() {
        return this.order.items.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0)
    }

    setCatalog(items: IProductItem[]) {
        this.catalog = items.map(item => new ProductItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: ProductItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if(!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        if (!this.order.payment) {
            errors.payment = 'Необходимо выбрать способ оплаты';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}
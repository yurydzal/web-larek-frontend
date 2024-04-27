import { Model } from "./base/Model";
import { FormErrors, IAppState, IBasketItem, IProductItem, ProductCategory, IOrder, PaymentOption, IOrderForm } from "../types";

export type CatalogChangeEvent = {
    catalog: IProductItem[]
};

export class AppState extends Model<IAppState> {
    catalog: IProductItem[];
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

    addToBasket(item: IProductItem) {
        this.basket.push(item);
        this.emitChanges('basket:changed');
    }

    removeFromBasket(item: IProductItem) {
        this.basket = this.basket.filter((element) => element.id != item.id);
        this.emitChanges('basket:changed');
    }

    clearBasket() {
        this.basket.forEach((item) => this.emitChanges('basket:remove', item));
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
        this.catalog = items;
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: IProductItem) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    getProducts(): IProductItem[] {
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
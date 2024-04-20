import {Component} from "./base/Component";
import {IProductItem, ProductCategory, CategoryCssClass} from "../types";
import {ProductCategoryMap} from '../utils/constants';
import {bem, createElement, ensureElement, formatNumber} from "../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard {
    id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
    inbasket: boolean;
}

export class Card extends Component<ICard> {
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _button?: HTMLButtonElement;
    protected _price?: HTMLElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._button = container.querySelector(`.${blockName}__button`);
        this._description = container.querySelector(`.${blockName}__description`);
        this._price = container.querySelector(`.${blockName}__price`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set description(value: string) {
        this.setText(this._description, value);
    }

    set price(value: number | null) {
        this._price.textContent = value ? `${value} синапсов` : 'Бесценно';
        if (this._button && !value) {
            this._button.disabled = true;
        }
    }

	get price(): number {
		return Number(this._price.textContent) || 0;
	}

    set inbasket(value: boolean) {
        if (!this._button.disabled) {
            this._button.disabled = value;
        }
    }
}

export class CardPreview extends Card {
	protected _description: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		this._description = container.querySelector(`.${this.blockName}__text`);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}
}

export class CatalogItem extends Card {
    protected _category: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card', container, actions);
        this._category = ensureElement<HTMLElement>(`.card__category`, container);
    }

    set category(category: ProductCategory) {
        const keyToFind = category;
        const object = ProductCategoryMap.find(item => item.key === keyToFind);

        this._category.textContent = category;
        this._category.classList.add(object.value);
    }
}
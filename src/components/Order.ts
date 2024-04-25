import {Form} from "./common/Form";
import {IOrder, IOrderForm} from "../types";
import {EventEmitter, IEvents} from "./base/events";
import {ensureElement, ensureAllElements} from "../utils/utils";

export class Order extends Form<IOrder> {
	protected _buttons: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._buttons = Array.from(container.querySelectorAll('.button_alt'));

        this._buttons.forEach((item) => {
            item.addEventListener('click', (event: MouseEvent) => {
                const target = event.target as HTMLButtonElement;
                const name = target.name;
                this.setButtonClass(name);
                events.emit('payment:changed', {target: name});
            })
        });
	}

    setButtonClass(name: string): void {
        this._buttons.forEach((button) => {
        if (button.name === name) {
            button.classList.add('button_alt-active');
        } else {
            button.classList.remove('button_alt-active');
        }
        });
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }
}

export class Contacts extends Form<IOrder> {

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }
}
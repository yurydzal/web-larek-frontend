import {Component} from "../base/Component";
import {ensureElement} from "../../utils/utils";

interface ISuccess {
    total: number;
}

interface ISuccessActions {
    onClick: () => void;
}

export class Success extends Component<ISuccess> {
    protected _close: HTMLElement;
    protected _total: HTMLElement;

    constructor(container: HTMLElement, actions: ISuccessActions, data: number) {
        super(container);

        this._close = ensureElement<HTMLElement>('.order-success__close', this.container);
        this._total = ensureElement<HTMLElement>('.order-success__description', this.container);

        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
            this.setText(this._total, `Списано ${data} синапсов`);
        }
    }
}
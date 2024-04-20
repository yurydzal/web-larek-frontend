import {CategotyMapping} from '../types';

export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {

};

export const ProductCategoryMap: CategotyMapping[] = [
    { key: 'хард-скил', value: 'card__category_hard' },
    { key: 'софт-скил', value: 'card__category_soft' },
    { key: 'дополнительное', value: 'card__category_additional' },
    { key: 'кнопка', value: 'card__category_button' },
    { key: 'другое', value: 'card__category_other' },
];
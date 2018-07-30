

'use strict';

import { ThunkAction, Dispatch, GetState } from "../container/Types";


const _updateBookshelf = (status): ThunkAction => ({
    params: {
        stateKeys: ['bookshelf'],
        status: status,
    },
    type: 'UPDATE_BOOKSHELF_LOCAL',
});

// 是否更新书架
export const updateBookshelf = (status: boolean) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_updateBookshelf(status));
};

const _updateChapter = (status): ThunkAction => ({
    params: {
        stateKeys: ['updateSection'],
        status: status
    },
    type: 'UPDATE_CHAPTER_LOCAL',
});

// 更新章节
export const updateChapter = (status: any) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_updateChapter(status));
};

const _isVip = (status): ThunkAction => ({
    params: {
        stateKeys: ['vip'],
        status: status
    },
    type: 'UPDATE_VIP_LOCAL',
});

// 是否会员
export const isVip = (status: any) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_isVip(status));
};














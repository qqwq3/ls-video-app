

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

const _readerPosition = (value): ThunkAction => ({
    params: {
        stateKeys: ['reader'],
        value: value
    },
    type: 'CHANGE_READER_POSITION_LOCAL',
});

// 改变阅读偏移
export const readerPosition = (value: Number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_readerPosition(value));
};

const _lightChapterTitle = (content, index): ThunkAction => ({
    params: {
        stateKeys: ['chapterTitle'],
        content: content,
        index: index,
    },
    type: 'CHAPTER_NAME_LIGHT_LOCAL',
});

// 点亮章节标题
export const lightChapterTitle = (content: Array<any>, index: number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_lightChapterTitle(content, index));
};










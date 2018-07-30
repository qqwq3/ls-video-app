
'use strict';

import { ThunkAction, Dispatch, GetState } from "../container/Types";
import { CALL_API } from "../common/Keys";
import { PAGE_CONTROL } from "../common/Keys";

const _loadCategory = (): ThunkAction => ({
    params: {
        stateKeys: ['category'],
    },
    [CALL_API]: {
        type: 'LOAD_CATEGORY_MENU',
        endpoint: `book/category-list`
    },
});

// 获取分类首页数据
export const loadCategory = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadCategory());
};

const _reloadClassification = (categoryId, refreshState, currentOffset): ThunkAction => ({
    params: {
        stateKeys: ['secondCategory'],
        currentOffset: currentOffset + PAGE_CONTROL
    },
    [CALL_API]: {
        type: 'RELOAD_CATEGORY_LIST',
        endpoint: `book/query?category_id=${categoryId}&limit=${PAGE_CONTROL}&offset=${currentOffset}`,
    },
});

// 获取二级分类页面数据 - 刷新
export const reloadClassification = (
    categoryId: string | number,
    refreshState: number | string,
    currentOffset: number = 0,
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_reloadClassification(categoryId, refreshState, currentOffset));
};

const _loadClassification = (categoryId, refreshState, currentOffset): ThunkAction => ({
    params: {
        stateKeys: ['secondCategory'],
        currentOffset: currentOffset + PAGE_CONTROL
    },
    [CALL_API]: {
        type: 'LOAD_CATEGORY_LIST',
        endpoint: `book/query?category_id=${categoryId}&limit=${PAGE_CONTROL}&offset=${currentOffset}`,
    },
});

// 获取二级分类页面数据 - 加载
export const loadClassification = (
    categoryId: string | number,
    refreshState: number | string,
    currentOffset: number = 0,
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadClassification(categoryId, refreshState, currentOffset));
};


const _reloadSearch = (bookName, refreshState, currentOffset): ThunkAction => ({
    params: {
        stateKeys: ['search'],
        currentOffset: currentOffset + PAGE_CONTROL,
    },
    [CALL_API]: {
        type: 'RELOAD_CATEGORY_SEARCH_LIST',
        endpoint: `book/query?book_name=${bookName}&limit=${PAGE_CONTROL}&offset=${currentOffset}`,
    },
});

// 搜索数据 - 刷新
export const reloadSearch = (bookName: string, refreshState, currentOffset: string | number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_reloadSearch(bookName, refreshState, currentOffset));
};


const _loadSearch = (bookName, refreshState, currentOffset): ThunkAction => ({
    params: {
        stateKeys: ['search'],
        currentOffset: currentOffset + PAGE_CONTROL,
    },
    [CALL_API]: {
        type: 'LOAD_CATEGORY_SEARCH_LIST',
        endpoint: `book/query?book_name=${bookName}&limit=${PAGE_CONTROL}&offset=${currentOffset}`,
    },
});

// 搜索数据 - 加载
export const loadSearch = (bookName: string, refreshState, currentOffset: string | number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadSearch(bookName, refreshState, currentOffset));
};




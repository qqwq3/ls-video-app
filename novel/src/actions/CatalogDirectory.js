
'use strict';

import {CALL_API, PAGE_CATALOG, PAGE_CONTROL} from "../common/Keys";
import {Dispatch, GetState, ThunkAction} from "../container/Types";

const _reloadChapterDirectory = (type, bookHex, refreshState, currentOffset): ThunkAction => ({
    params: {
        stateKeys: [type, bookHex, 'directory'],
        currentOffset: currentOffset + PAGE_CATALOG,
    },
    [CALL_API]: {
        type: 'RELOAD_CATALOG_DIRECTORY_LIST',
        endpoint: `book/get-chapters-pager?book_id=${bookHex}&limit=${PAGE_CATALOG}&offset=${currentOffset}`,
    },
});

// 获取章节目录 - 刷新
export const reloadChapterDirectory = (
    type: string,
    bookHex: string | number,
    refreshState: number | string,
    currentOffset: number = 0,
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_reloadChapterDirectory(type, bookHex, refreshState, currentOffset));
};


const _loadChapterDirectory = (type, bookHex, refreshState, currentOffset): ThunkAction => ({
    params: {
        stateKeys: [type, bookHex, 'directory'],
        currentOffset: currentOffset + PAGE_CATALOG,
    },
    [CALL_API]: {
        type: 'LOAD_CATALOG_DIRECTORY_LIST',
        endpoint: `book/get-chapters-pager?book_id=${bookHex}&limit=${PAGE_CATALOG}&offset=${currentOffset}`,
    },
});

// 获取章节目录 - 加载
export const loadChapterDirectory = (
    type: string,
    bookHex: string | number,
    refreshState: number | string,
    currentOffset: number = 0,
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadChapterDirectory(type, bookHex, refreshState, currentOffset));
};


const _reloadBookMark = (type, bookHex, refreshState, currentOffset): ThunkAction => ({
    params: {
        stateKeys: [type, bookHex, 'mark'],
        currentOffset: currentOffset + PAGE_CATALOG,
    },
    [CALL_API]: {
        type: 'RELOAD_CATALOG_BOOK_MARK_LIST',
        endpoint: `book/get-book-reads?limit=${PAGE_CATALOG}&offset=${currentOffset}`,
    },
});

// 获取书签 - 刷新
export const reloadBookMark = (
    type: string,
    bookHex: string | number,
    refreshState: number | string,
    currentOffset: number = 0,
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_reloadBookMark(type, bookHex, refreshState, currentOffset));
};


const _loadBookMark = (type, bookHex, refreshState, currentOffset): ThunkAction => ({
    params: {
        stateKeys: [type, bookHex, 'mark'],
        currentOffset: currentOffset + PAGE_CATALOG,
    },
    [CALL_API]: {
        type: 'LOAD_CATALOG_BOOK_MARK_LIST',
        endpoint: `book/get-book-reads?limit=${PAGE_CATALOG}&offset=${currentOffset}`,
    },
});

// 获取书签 - 加载
export const loadBookMark = (
    type: string,
    bookHex: string | number,
    refreshState: number | string,
    currentOffset: number = 0,
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadBookMark(type, bookHex, refreshState, currentOffset));
};







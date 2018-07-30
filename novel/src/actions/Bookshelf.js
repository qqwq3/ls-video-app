
'use strict';

import { ThunkAction, Dispatch, GetState } from "../container/Types";
import { CALL_API, PAGE_CONTROL } from "../common/Keys";
import { dictToFormData } from "../common/Tool";

const _reloadBookshelf = (currentOffset): ThunkAction => ({
    params: {
        stateKeys: ['main'],
        currentOffset: PAGE_CONTROL + currentOffset,
    },
    [CALL_API]: {
        type: 'RELOAD_BOOKSHELF_LIST',
        endpoint: `book/get-bookrack?limit=${PAGE_CONTROL}&offset=${currentOffset}`,
    }
});

// 重新加载书架
export const reloadBookshelf = ( currentOffset: number = 0, refreshState: number | string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_reloadBookshelf(currentOffset, refreshState));
};


const _loadBookshelf = (currentOffset): ThunkAction => ({
    params: {
        stateKeys: ['main'],
        currentOffset: currentOffset + PAGE_CONTROL,
    },
    [CALL_API]: {
        type: 'LOAD_BOOKSHELF_LIST',
        endpoint: `book/get-bookrack?limit=${PAGE_CONTROL}&offset=${currentOffset}`,
    }
});

// 加载书架
export const loadBookshelf = (currentOffset: number = 0) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadBookshelf(currentOffset));
};


const _singleBookDel = (bookId, bookType): ThunkAction => ({
    params: {
        stateKeys: ['main','delete'],
    },
    [CALL_API]: {
        type: 'OPERATE_BOOKSHELF_BOOK',
        endpoint: 'book/bookcase/delete',
        options: {
            method: 'POST',
            body: dictToFormData({
                book_type: bookType,
                book_id: bookId,
            })
        }
    },
});

// 单个收藏删除
export const singleBookDel = (bookId: string | number, bookType: string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_singleBookDel(bookId, bookType));
};


const _batchBookDel = (bookIdStr, bookTypeStr): ThunkAction => ({
    params: {
        stateKeys: ['main','delete'],
    },
    [CALL_API]: {
        type: 'OPERATE_BOOKSHELF_BATCH_BOOKS',
        endpoint: 'book/bookcase/batch_delete',
        options: {
            method: 'POST',
            body: dictToFormData({
                book_type: bookTypeStr,
                book_ids : bookIdStr,
            })
        }
    },
});

// 批量删除收藏
export const batchBookDel = (bookIdStr: string, bookTypeStr: string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_batchBookDel(bookIdStr, bookTypeStr));
};









'use strict';

import { ThunkAction, Dispatch, GetState } from "../container/Types";
import { CALL_API, PAGE_CONTROL, PAGE_CATALOG } from "../common/Keys";
import { PAGE_CONTROL_COMMENTS } from "../common/Keys";
import { dictToFormData } from "../common/Tool";

// 获取详情
const _loadDetails = (bookHex): ThunkAction => ({
    params: {
        stateKeys: [bookHex, 'detail'],
    },
    [CALL_API]: {
        type: 'LOAD_DETAILS',
        endpoint: `book/detail?id=${bookHex}`,
    },
});

export const loadDetails = (bookHex: string | number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadDetails(bookHex));
};

// 猜你喜欢
const _loadDetailSimilar = (bookHex, bookId): ThunkAction => ({
    params: {
        stateKeys: [bookHex, 'similar'],
    },
    [CALL_API]: {
        type: 'LOAD_DETAILS_SIMILAR',
        endpoint: `book/similar?book_id=${bookId}`,
    },
});

export const loadDetailSimilar = (bookHex: string | number, bookId: string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadDetailSimilar(bookHex, bookId));
};

const _reloadBookComments = (bookHex, bookId, currentOffset): ThunkAction => ({
    params: {
        stateKeys: [bookHex, 'comments'],
        currentOffset: currentOffset + PAGE_CONTROL_COMMENTS,
    },
    [CALL_API]: {
        type: 'RELOAD_DETAILS_COMMENTS_BOOK',
        endpoint: `book/get-comments?book_id=${bookId}&limit=${PAGE_CONTROL_COMMENTS}&offset=${currentOffset}`,
    },
});

// 获取这边书的评论 - 刷新
export const reloadBookComments = (
    bookHex: string | number,
    bookId: string,
    currentOffset: number = 0
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_reloadBookComments(bookHex, bookId, currentOffset));
};

const _loadBookComments = (bookHex, bookId, currentOffset): ThunkAction => ({
    params: {
        stateKeys: [bookHex, 'comments'],
        currentOffset: currentOffset + PAGE_CONTROL_COMMENTS,
    },
    [CALL_API]: {
        type: 'LOAD_DETAILS_COMMENTS_BOOK',
        endpoint: `book/get-comments?book_id=${bookId}&limit=${PAGE_CONTROL_COMMENTS}&offset=${currentOffset}`,
    },
});

// 获取这边书的评论 - 加载
export const loadBookComments = (bookHex: string | number, bookId: string, currentOffset: number = 0) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadBookComments(bookHex, bookId, currentOffset));
};

const _likeComments = (bookHex, commentsId): ThunkAction => ({
    params: {
        stateKeys: [bookHex, 'user']//'comments','like'],
    },
    [CALL_API]: {
        type: 'BOOK_DETAILS_COMMENTS_LIKE',
        endpoint: `book/like-comment`,
        options: {
            method: 'post',
            body: dictToFormData({
                comment_id: commentsId,
            }),
        },
    },
});

// 评论点赞
export const likeComments = (bookHex: string | number, commentsId: string | number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_likeComments(bookHex, commentsId));
};

const _addBookshelf = (bookHex, bookId): ThunkAction => ({
    params: {
        stateKeys: [bookHex, 'user']
    },
    [CALL_API]: {
        type: 'BOOK_DETAILS_ADD_BOOKSHELF',
        endpoint: `book/add-book-case`,
        options: {
            method: 'POST',
            body: dictToFormData({
                book_id: bookId,
            }),
        },
    },
});

// 加入书架
export const addBookshelf = (bookHex: string | number, bookId: string | number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_addBookshelf(bookHex, bookId));
};

const _checkIsAddBookshelf = (bookHex) => ({
    params: {
        stateKeys: [bookHex, 'exists']
    },
    [CALL_API]: {
        type: 'BOOK_DETAILS_CHECK_IS_ADD_BOOKSHELF',
        endpoint: `book/bookcase/exists?book_id=${bookHex}`,
    }
});

// 检测是否加入书架
export const checkIsAddBookshelf = (bookHex: string | number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_checkIsAddBookshelf(bookHex));
};

const _cancelAddBookshelf = (bookHex, bookType) => ({
    params: {
        stateKeys: [bookHex,'cancel']
    },
    [CALL_API]: {
        type: 'BOOK_DETAILS_CANCEL_ADD_BOOKSHELF',
        endpoint: `book/bookcase/delete`,
        options: {
            method: 'POST',
            body: dictToFormData({
                book_type: bookType,
                book_id: bookHex,
            }),
        },
    },
});

// 取消加入书架
export const cancelAddBookshelf = (bookHex: string | number, bookType: string = 'bookcase') => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_cancelAddBookshelf(bookHex, bookType));
};










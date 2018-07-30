
'use strict';

import { ThunkAction, Dispatch, GetState } from "../container/Types";
import { CALL_API } from "../common/Keys";
import { dictToFormData } from "../common/Tool";

const _getChapter = (hexId, bookId, confirmPay, bookHexId): ThunkAction => ({
    params: {
        stateKeys: ['chapter', bookHexId]
    },
    [CALL_API]: {
        type: 'GET_READER_CHAPTER',
        endpoint: bookId ? `book/get-chapter?chapter_id=${hexId}&book_id=${bookId}&confirm_pay=${confirmPay}` :
                 `book/get-chapter?chapter_id=book_id${hexId}&confirm_pay=${confirmPay}`
    }
});

// 获取章节
export const getChapter = (
    hexId: string,
    bookId?: string = false,
    confirmPay: string = '0',
    bookHexId: string,
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_getChapter(hexId, bookId, confirmPay, bookHexId));
};

const _addComments = (bookHexId, bookId, chapterId, content): ThunkAction => ({
    params: {
        stateKeys: ['chapter', bookHexId]
    },
    [CALL_API]: {
        type: 'POST_READER_COMMENTS',
        endpoint: `book/add-comment`,
        options: {
            method: 'POST',
            body: dictToFormData({
                book_id: bookId,
                chapter_id: chapterId,
                content: content,
            }),
        },
    },
});

// 书写评论
export const addComments = (
    bookHexId: string ,
    bookId: string | number,
    chapterId: string,
    content: string
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_addComments(bookHexId, bookId, chapterId, content));
};











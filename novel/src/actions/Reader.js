
'use strict';

import { ThunkAction, Dispatch, GetState } from "../container/Types";
import { CALL_API } from "../common/Keys";
import { dictToFormData } from "../common/Tool";

const _getChapter = (bookHexId, bookId, chapterHexId, confirmPay): ThunkAction => ({
    params: {
        stateKeys: ['chapter', bookHexId],
    },
    [CALL_API]: {
        type: 'GET_READER_CHAPTER',
        endpoint: `book/get-chapter?chapter_id=${chapterHexId}&book_id=${bookId}&confirm_pay=${confirmPay}`
    },
});

// 获取章节
export const getChapter = (
    bookHexId: string,
    bookId: string | number,
    chapterHexId: string,
    confirmPay?: number = 0
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_getChapter(bookHexId, bookId, chapterHexId, confirmPay));
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











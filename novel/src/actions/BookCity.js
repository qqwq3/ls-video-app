
'use strict';

import { ThunkAction, Dispatch, GetState } from "../container/Types";
import { CALL_API } from "../common/Keys";

const _loadBookCity = (): ThunkAction => ({
    params: {
        stateKeys: ['bookCity','home'],
    },
    [CALL_API]: {
        type: 'GET_BOOK_CITY',
        endpoint: `book/get-promotion?promotion_id=2,3,4,5,6,7,8,9`,
    },
});

// 获取书城首页
export const loadBookCity = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadBookCity());
};




















'use strict';

import humps from 'humps';
import { ThunkAction, Dispatch, GetState } from "../container/Types";
import { CALL_API } from "../common/Keys";
import { toJS } from "../common/Tool";

const _loadRandKing = (sort_by): ThunkAction => ({
    params: {
        stateKeys: ['main', humps.camelize(sort_by)],
    },
    [CALL_API]: {
        type: 'GET_RANDKINGS_LIST',
        endpoint: `book/get-top-list?sort_by=${sort_by}`,
    },
});

// 获取书城首页
export const loadRandKing = (sort_by: string) => (dispatch: Dispatch, getState: GetState) => {
    const state = getState && getState();
    const data = state.getIn(['rankings', 'main', humps.camelize(sort_by)]);

    if(data !== undefined){
        return;
    }

    return dispatch(_loadRandKing(sort_by));
};
















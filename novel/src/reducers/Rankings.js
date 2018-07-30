
'use strict';

import Immutable from 'immutable';
import { Action } from "../container/Types";
import { RefreshState, safeError } from "../common/Tool";

const initialState = Immutable.fromJS({

});

const rankings = (state = initialState, action: Action) => {
    // 请求成功统一处理
    if(action.type.indexOf('_RANDKINGS') > 0){
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = ['error'];
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            // 排行榜 - 成功
            case 'GET_RANDKINGS_LIST_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    ...action.response,
                    refreshState: RefreshState.Idle,
                });
        }

        // 列表类单独的处理
        if (action.type.endsWith('_REQUEST') || action.type.endsWith('_FAILURE')) {
            let command = action.type.split('_').splice(-1)[0];
            switch (command) {
                case 'FAILURE':
                    let rs = RefreshState.Failure;
                    let error = safeError(action.error);
                    if (error.code === 404) {
                        rs = action.type.startsWith('RELOAD_') ? RefreshState.NoMoreDataHeader : RefreshState.NoMoreDataFooter;
                    }
                    return state.mergeDeepIn(action.params.stateKeys, {
                        refreshState: rs,
                        error,
                    });
                case 'REQUEST':
                    return state.setIn(action.params.stateKeys.concat(['refreshState'])
                        , action.type.startsWith('RELOAD_') ? RefreshState.HeaderRefreshing : RefreshState.FooterRefreshing);
            }
        }
    }

    return state;
};

export default rankings;























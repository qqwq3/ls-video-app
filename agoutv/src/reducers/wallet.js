
'use strict';

import type { Action } from "../actions/types";
import Immutable from 'immutable';

const util = require('../common/Util');
const initialState = Immutable.fromJS({});

const wallet = (state = initialState, action: Action) => {
    if (action.type.indexOf('_WALLET') > 0) {
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            // 收入排行列表获取成功 - 成功
            case 'INCOME_RANK_WALLET_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    [action.params.messageKey]: {
                        ...action.response,
                    },
                });

            // 收入排行列表获取失败 - 失败
            case 'INCOME_RANK_WALLET_FAILURE':
                return state.setIn(action.params.stateKeys,{
                    data: null,
                });

            // 提现 - 成功
            case 'WITHDRAW_WALLET_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    [action.params.messageKey]: {
                        timeUpdated:Date.now(),
                        ...action.response,
                    },
                });

            // 提现 - 失败
            case 'WITHDRAW_WALLET_FAILURE':
                return state.setIn(action.params.stateKeys,{
                    [action.params.messageKey]: {
                        timeUpdated:Date.now(),
                        ...action.error,
                    },
                });
        }

    }

    return state;
};

module.exports = wallet;
























'use strict';

import type { Action } from "../actions/types";
import Immutable from 'immutable';

const util = require('../common/Util');
const initialState = Immutable.fromJS({ });

const task = (state = initialState, action: Action) => {
    if (action.type.indexOf('_TASK') > 0) {
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = ['error'];
        let stateKeysErr = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey) || state.hasIn(stateKeysErr)) {
            state = state.deleteIn(errorKey);
            state = state.deleteIn(stateKeysErr);
        }

        switch (action.type) {
            // 获取任务列表信息 - 成功
            case 'LOAD_INFO_TASK_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    ...action.response,
                    //timeUpdated: Date.now(),
                });

            // 获取特权说明信息 - 成功
            case 'LOAD_LEVEL_INFO_TASK_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    ...action.response,
                });

            // 获取答题信息 - 成功
            case 'LOAD_ANSWER_QUESTIONS_TASK_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    ...action.response,
                });

            // 提交答案 - 成功
            case 'SUBMIT_ANSWER_TASK_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    timeUpdated:Date.now(),
                    ...action.response
                });

            // 领取金币和经验 - 成功
            case 'SUBMIT_RECEIVE_TASK_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    ...action.response,
                    receiveTimeUpdated: Date.now(),
                });

            // 提交 - 成功
            case 'ADD_PUBLIC_TASK_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    ...action.response,
                    addPublicTimeUpdated: Date.now(),
                });

            // 获取签到基本信息 - 成功
            case 'INIT_SIGN_TASK_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    timeUpdated:Date.now(),
                    initSign: {...action.response}
                });

            // 提交签到 - 成功
            case 'POST_SIGN_TASK_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    isSign: true,
                    timeUpdated:Date.now(),
                    sign: {...action.response}
                });

            // 初始化宝箱 - 成功
            case 'INIT_BOX_TASK_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    timeUpdated:Date.now(),
                    initTBox: {...action.response}
                });

            // 打开宝箱 - 成功
            case 'OPEN_BOX_TASK_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    isBox: true,
                    timeUpdated:Date.now(),
                    openTBox: {...action.response}
                });
        }

        // 失败或请求中统一处理
        if (action.type.endsWith('_FAILURE')) {
            let stateKeys = ['error'];//action.params.stateKeys;
            let command = action.type.split('_').splice(-1)[0];
            switch (command) {
                case 'FAILURE':
                    return state.setIn(stateKeys,{
                        timeUpdated: Date.now(),
                        ...action
                    });
                // case 'REQUEST':
                //     return state.setIn(stateKeys,{
                //         timeUpdated: Date.now(),
                //     });
            }
        }
    }

    return state;
};

module.exports = task;























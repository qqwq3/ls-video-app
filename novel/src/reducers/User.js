
'use strict';

import Immutable from 'immutable';
import { Action } from "../container/Types";
import { saveUserSession, removeUserSession } from "../common/Storage";
import { RefreshState, safeError } from "../common/Tool";

const initialState = Immutable.fromJS({});

const user = (state = initialState, action: Action) => {
    // 请求成功统一处理
    if(action.type.indexOf('_USER') > 0) {
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示

        // let errorKey = ['error'];
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            // 登录 - 成功
            case 'POST_LOGIN_USER_SUCCESS':
                // 拿得用户数据
                let us = action.response.data;
                // 记录状态
                saveUserSession && saveUserSession(us);
                return state.mergeDeepIn(action.params.stateKeys, {
                    login: true,
                    loginTimeUpdated: Date.now(),
                    ...us
                });

            // 用户退出 - 成功
            case  'POST_LOGOUT_USER_SUCCESS':
                // 删除用户session
                removeUserSession && removeUserSession();

                return state.setIn(action.params.stateKeys, {
                    login: false,
                    logoutTimeUpdated: Date.now(),
                    ...action.response,
                });

            // 登录 - 获取scope和state - 成功
            case 'GET_LOGIN_INFO_USER_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    getAppInfoTimeUpdated: Date.now(),
                    ...action.response
                });

            // 检测签到 -  成功
            case 'CHECK_SIGN_IN_USER_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    timeCheckUpdated: Date.now(),
                    check: {...action.response}
                });

            // 签到 -  成功
            case 'POST_SIGN_IN_USER_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    timeSignUpdated: Date.now(),
                    ...action.response
                });

            // VIP
            case 'POST_OPENVIP_USER_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    ...action.response
                });

            // 代理申请
            case 'POST_APPLYAGENT_USER_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    applyAgentTimeUpdated: Date.now(),
                    ...action.response.data,...action.params
                });

            // 发送验证码
            case 'POST_SENDVERCODE_USER_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    sendVercodeTimeUpdated: Date.now(),
                    ...action.response
                });

            // 代理验证
            case 'POST_APPLYTEXT_USER_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    applyTextTimeUpdated: Date.now(),
                    ...action.response.data
                });

            // 我的信息
            case 'GET_MYDATA_INFO_USER_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    ...action.response.data
                });

            // 书币充值验证码验证
            case 'POST_RECHARGE_USER_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    ...action.response
                });
            //我的书评
            // 分类二级 - 刷新 - 成功
            case 'RELOAD_COMMENTS_USER_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    updateTime: Date.now(),
                    refreshState: RefreshState.Idle,
                    ...action.params,
                    ...action.response.data,
                });
            //  分类二级 - 加载 - 成功
            case 'LOAD_COMMENTS_USER_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    if (typeof m === 'undefined' || !m.has('records')) {
                        return {
                            ...action.response,
                            updateTime: Date.now(),
                            refreshState: RefreshState.Idle,
                            ...action.params,
                        };
                    }
                    let records = m.get('records').concat(action.response.data.records);
                    return {
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,
                        ...action.response.data,
                        records: records.toJS(),
                    };
                });
                // 我看过的
            // 分类二级 - 刷新 - 成功
            case 'RELOAD_HISTORICAL_USER_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    updateTime: Date.now(),
                    refreshState: RefreshState.Idle,
                    ...action.params,
                    ...action.response.data,
                });
            //  分类二级 - 加载 - 成功
            case 'LOAD_HISTORICAL_USER_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    if (typeof m === 'undefined' || !m.has('records')) {
                        return {
                            ...action.response,
                            updateTime: Date.now(),
                            refreshState: RefreshState.Idle,
                            ...action.params,
                        };
                    }
                    let records = m.get('records').concat(action.response.data.records);
                    return {
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,
                        ...action.response.data,
                        records: records.toJS(),
                    };
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
                    if(action.type.startsWith('RELOAD_')) {
                        return state.setIn(action.params.stateKeys.concat(['refreshState']), RefreshState.HeaderRefreshing);
                    }
                    else if (action.type.startsWith('LOAD_')) {
                        return state.setIn(action.params.stateKeys.concat(['refreshState']), RefreshState.FooterRefreshing);
                    }
            }
        }
    }

    return state;
};

export default user;





















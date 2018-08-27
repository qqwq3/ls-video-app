'use strict';

import type { Action } from "../actions/types";
import Immutable from 'immutable';
import { saveUserSession, removeUserSession } from "../common/Storage";
import { RefreshState } from "../Constants";

const util = require('../common/Util');
const initialState = Immutable.fromJS({});

const user = (state = initialState, action: Action) => {
    if (action.type.indexOf('_USER') > 0) {
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
            // 合并用户信息
            case 'LOCAL_LOGIN_CHECK_USER':
                return state.mergeDeepIn(action.params.stateKeys, {
                    login: action.params.status,
                });

            // 新消息提示
            case 'LOAD_MESSAGE_PROMPT_USER':
                return state.setIn(action.params.stateKeys, {
                    isMessage: action.params.status,
                });

            // 金币兑换零钱 - 成功
            case 'POST_GOLD_EXCHANGE_USER_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    ...action.response,
                });

            // 用户退出 - 成功
            case 'LOGOUT_USER_SUCCESS':
                // 删除本地用户个人信息
                removeUserSession && removeUserSession();

                return state.setIn(action.params.stateKeys, {
                    //...action,
                    login: false,
                });

            // 登录 - 成功
            case 'LOGIN_USER_SUCCESS':
                // 设置用户名
                let us = action.response.data;

                // 记录状态
                saveUserSession && saveUserSession(us);

                // 设置状态
                return state.mergeDeepIn(action.params.stateKeys, {
                    ...us,
                    login: true,
                });

            // 登录 - 失败
            case 'LOGIN_USER_FAILURE':
                return state
                    .setIn(action.params.stateKeys.concat(['processID']), Date.now())
                    .setIn(action.params.stateKeys.concat(['error']), {...action});

            case 'BIND_INVITE_USER_FAILURE':
                return state.mergeDeepIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    [action.params.messageKey]: {
                        ...util.safeError(action.error),
                        timeUpdated: Date.now(),
                    },
                });

            case 'BIND_INVITE_USER_SUCCESS':
                let message = '';
                if (action.type === 'BIND_SP_INVITE_SUCCESS') {
                    message = '兑换成功，您的每日看片次数变更为：' + action.response.data.playOfDay + '，无限看片2天。';
                } else {
                    message = '账户切换成功，若信息未变更，请退出界面重新打开。';
                }
                global.launchSettings.spi.merge(action.response.data);
                return state.mergeDeepIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    [action.params.messageKey]: {
                        timeUpdated: Date.now(),
                        message: message,
                    },
                });

            // 唤醒好友 - 刷新 - 成功
            case 'RELOAD_NOTICE_FRIENDS_USER_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    ...action.response.data,
                    updateTime: Date.now(),
                    refreshState: RefreshState.Idle,
                    ...action.params,
                });

            // 邀请收徒 - 加载 - 成功
            case 'LOAD_NOTICE_FRIENDS_USER_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    if (typeof m === 'undefined' || !m.has('records')) {
                        return {
                            ...action.response.data,
                            updateTime: Date.now(),
                            refreshState: RefreshState.Idle,
                            ...action.params,

                        };
                    }

                    let records = m.get('records').concat(action.response.data.records);

                    return {
                        ...action.response.data,
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        records: records.toJS(),
                        ...action.params,
                    };
                });

            // 邀请收徒 - 刷新 - 成功
            case 'RELOAD_INVITE_ENLIGHTENING_USER_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    ...action.response.data,
                    updateTime: Date.now(),
                    refreshState: RefreshState.Idle,
                    ...action.params,
                });

            // 邀请收徒 - 加载 - 成功
            case 'LOAD_INVITE_ENLIGHTENING_USER_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    if (typeof m === 'undefined' || !m.has('records')) {
                        return {
                            ...action.response.data,
                            updateTime: Date.now(),
                            refreshState: RefreshState.Idle,
                            ...action.params,

                        };
                    }

                    let records = m.get('records').concat(action.response.data.records);

                    return {
                        ...action.response.data,
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        records: records.toJS(),
                        ...action.params,
                    };
                });

            // 获取我的钱包 - 成功
            case 'LOAD_WALLET_USER_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    ...action.response,
                    updateTime: Date.now(),
                });

            // 获取验证码 - 失败
            case 'VERIFY_CODE_USER_FAILURE':
                return state.setIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    isCode: false,
                    sendCode: {...action.error}
                });

            // 获取验证码 - 成功
            case 'VERIFY_CODE_USER_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    isCode: true,
                    sendCode: {...action.response}
                });

            // 绑定手机 - 成功
            case 'PHONE_USER_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    isPhone: true,
                    bindPhone: {...action.response,}
                });

            // 绑定手机 - 失败
            case 'PHONE_USER_FAILURE':
                return state.setIn(action.params.stateKeys,{
                    isPhone: false,
                    bindPhone: {...action.error},
                });

            // 读取用户会话成功
            case 'LOAD_USER_SESSION_SUCCESS':
                return state.setIn(action.params.stateKeys, action.data);

            // 填写邀请码 - 成功
            case 'POST_INVITE_CODE_USER_SUCCESS':
                return state.setIn(action.params.stateKeys,{
                    prompt: true,
                    res: { ...action.response }
                });

            // 填写邀请码 - 失败
            case 'POST_INVITE_CODE_USER_FAILURE':
                return state.setIn(action.params.stateKeys,{
                    prompt: false,
                    res: { ...action.error }
                });

            // 获取个人信息 - 成功
            case 'LOAD_PERSONAL_INFO_USER_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    ...action.response,
                    timeUpdated: Date.now(),
                });
        }

        if (action.type.endsWith('_FAILURE')) {
            let stateKeys = ['error'];
            let command = action.type.split('_').splice(-1)[0];
            switch (command) {
                case 'FAILURE':
                    return state.setIn(stateKeys, {
                        timeUpdated: Date.now(),
                        ...action
                    });
            }
        }
    }

    return state;
};

module.exports = user;
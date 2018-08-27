'use strict';

import type {Dispatch, GetState, ThunkAction} from "./types";
import {CALL_API, CALL_STORAGE, INVITE_LIMIT} from "../Constants";

const util = require('../common/Util');

const _logOut = (): ThunkAction => ({
    params: {
        stateKeys: ['userData'],
    },
    [CALL_API]: {
        type: 'LOGOUT_USER',
        endpoint: 'user/logout',
        options: {method: 'POST'}
    },
});

/**
 * 退出登录 /user/logout
 */
export const logOut = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_logOut());
};

const _logIn = (code, state): ThunkAction => {
    return {
        params: {
            stateKeys: ['userData'],
        },
        [CALL_API]: {
            type: 'LOGIN_USER',
            endpoint: 'user/login/weixin/callback',
            options: {
                method: 'POST',
                body: util.dictToFormData({
                    code:code,
                    state:state
                }),
            },
        },
    };
};

/**
 * 登录
 * @param userName
 * @param userPwd
 */
export const wxLogIn = (code, state) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_logIn(code, state));
};

const _loadSession = (): ThunkAction => ({
    params: {
        stateKeys: ['userData'],
    },
    [CALL_STORAGE]: {
        type: 'LOAD_USER_SESSION',
        method: 'loadUserSession',
    },
});

/**
 * 加载用户会话
 */
export const loadSession = () => (dispatch: Dispatch, getState: GetState) => {
    let state = getState();
    let action = _loadSession();
    let session = state.getIn(['user'].concat(action.params.stateKeys));

     // if (typeof session === 'object' && typeof session.authorizedKey !== 'undefined') {
     //     return null;
     // }

    return dispatch(action);
};

const _bindInvite = (instanceUniqueId: string): ThunkAction => ({
    params: {
        stateKeys: ['device'],
        messageKey: 'bind',
    },
    [CALL_API]: {
        type: 'BIND_INVITE_USER',
        endpoint: `spread/exchange`,
        options: {
            method: 'POST',
            body: util.dictToFormData({
                code: instanceUniqueId,
            }),
        },
    },
});



/***
 * 绑定邀请关系
 * @param instanceUniqueId 推广代码（推广实例唯一码）
 * @returns {Promise.<*>}
 */
export const bindInvite = (instanceUniqueId: string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_bindInvite(instanceUniqueId));
};


//---登录检测
const _loginCheck = (status) => ({
    params: {
        stateKeys: ['userData'],
        status: status,
    },
    type: 'LOCAL_LOGIN_CHECK_USER'
});

export const loginCheck = (status: boolean) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loginCheck(status));
};

/***
 * 获取验证码
 * @param phoneNumber
 */
const _getVerCode = (phoneNumber): ThunkAction => ({
    params: {
        stateKeys: ['userData','verCode']
    },
    [CALL_API]: {
        type: 'VERIFY_CODE_USER',
        endpoint: `user/mobile/send_set_verify_code`,
        options: {
            method: 'POST',
            body: util.dictToFormData({
                mobile: phoneNumber,
            }),
        },
    },
});

export const getVerCode = (phoneNumber: string | number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_getVerCode(phoneNumber));
};


/**
 * 绑定手机
 * @param phoneNumber
 * @param code
 */
const _bindPhone = (phoneNumber, code): ThunkAction => ({
    params: {
        stateKeys: ['userData','phone']
    },
    [CALL_API]: {
        type: 'PHONE_USER',
        endpoint: `user/mobile/bind_v2`,
        options: {
            method: 'POST',
            body: util.dictToFormData({
                mobile: phoneNumber,
                vcode: code,
            }),
        },
    },
});

export const bindPhone = (phoneNumber: string | number, code: string | number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_bindPhone(phoneNumber, code));
};


// 填写邀请码
const _inviteCode = (code): ThunkAction => ({
    params: {
        stateKeys: ['userData','invite'],
    },
    [CALL_API]: {
        type: 'POST_INVITE_CODE_USER',
        endpoint: `user/exchange`,
        options: {
            method: 'POST',
            body: util.dictToFormData({
                code: code,
            }),
        },
    },
});

export const inviteCode = (code: string | number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_inviteCode(code));
};


// 获取个人信息
const _personalCenter = (): ThunkAction => ({
    params: {
        stateKeys: ['userData','personal'],
    },
    [CALL_API]: {
        type: 'LOAD_PERSONAL_INFO_USER',
        endpoint: `user/personal_center`,
    },
});

export const personalCenter = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_personalCenter());
};


// 获取我的钱包信息
const _myWallet = (): ThunkAction => ({
    params: {
        stateKeys: ['userData','wallet'],
    },
    [CALL_API]: {
        type: 'LOAD_WALLET_USER',
        endpoint: 'user/my_wallet',
    },
});

export const myWallet = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_myWallet());
};


// 邀请收徒 - 加载
const _loadInviteInfo = (currentOffset,refreshState,filterObj): ThunkAction => ({
    params: {
        selectedObj: filterObj,
        stateKeys: ['root', 'dataRet'],
        offset: currentOffset + INVITE_LIMIT,
    },
    [CALL_API]: {
        type: 'LOAD_INVITE_ENLIGHTENING_USER',
        endpoint: `user/invite_info?offset=${currentOffset}&limit=${INVITE_LIMIT}`,
        refreshState: refreshState,
    },
});

// 邀请收徒 - 刷新
const _reLoadInviteInfo = (currentOffset,refreshState,filterObj): ThunkAction => ({
    params: {
        selectedObj: filterObj,
        stateKeys: ['root','dataRet'],
        offset: currentOffset,
    },
    [CALL_API]: {
        type: 'RELOAD_INVITE_ENLIGHTENING_USER',
        endpoint: `user/invite_info?offset=${currentOffset}&limit=${INVITE_LIMIT}`,
        refreshState: refreshState,
    },
});

export const loadInviteInfo = (currentOffset: number | string, refreshState: number | string, filterObj: Object) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadInviteInfo(currentOffset,refreshState,filterObj));
};

export const reLoadInviteInfo = (currentOffset: number | string, refreshState: number | string, filterObj: Object) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_reLoadInviteInfo(currentOffset,refreshState,filterObj));
};

// 唤醒好友 - 刷新
const _reLoadNoticeFriends = (currentOffset,refreshState,filterObj): ThunkAction => ({
    params: {
        selectedObj: filterObj,
        stateKeys: ['root','dataRetFriends'],
        offset: currentOffset,
    },
    [CALL_API]: {
        type: 'RELOAD_NOTICE_FRIENDS_USER',
        endpoint: `user/notice_friends?offset=${currentOffset}&limit=${INVITE_LIMIT}`,
        refreshState: refreshState,
    },
});

// 唤醒好友 - 加载
const _loadNoticeFriends = (currentOffset,refreshState,filterObj): ThunkAction => ({
    params: {
        selectedObj: filterObj,
        stateKeys: ['root','dataRetFriends'],
        offset: currentOffset + INVITE_LIMIT,
    },
    [CALL_API]: {
        type: 'LOAD_NOTICE_FRIENDS_USER',
        endpoint: `user/notice_friends?offset=${currentOffset}&limit=${INVITE_LIMIT}`,
        refreshState: refreshState,
    },
});

export const loadNoticeFriends = (currentOffset: number | string, refreshState: number | string, filterObj: Object) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadNoticeFriends(currentOffset,refreshState,filterObj));
};

export const reLoadNoticeFriends = (currentOffset: number | string, refreshState: number | string, filterObj: Object) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_reLoadNoticeFriends(currentOffset,refreshState,filterObj));
};


// 新消息提示
const _newMessagePrompt = (status) => ({
    params: {
        status: status,
        stateKeys: ['userData','message'],
    },
    type: 'LOAD_MESSAGE_PROMPT_USER',
});

export const newMessagePrompt = (status: boolean) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_newMessagePrompt(status));
};


// 金币兑换零钱
const _goldExchangeMoney = (amount) => ({
    params: {
        stateKeys: ['userData','exchange'],
    },
    [CALL_API]: {
        type: 'POST_GOLD_EXCHANGE_USER',
        endpoint: `user/gold_coin_exchange`,
        options: {
            method: 'POST',
            body: util.dictToFormData({amount: amount}),
        },
    },
});

export const goldExchangeMoney = (amount: number | string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_goldExchangeMoney(amount));
};






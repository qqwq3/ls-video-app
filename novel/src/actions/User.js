'use strict';

import { ThunkAction, Dispatch, GetState } from "../container/Types";
import { CALL_API } from "../common/Keys";
import { PAGE_CONTROL } from "../common/Keys";
import { dictToFormData } from '../common/Tool';

const _weChatLogin = (code, state): ThunkAction => ({
    params: {
        stateKeys: ['userData','baseInfo'],
    },
    [CALL_API]: {
        type: 'POST_LOGIN_USER',
        endpoint: `user/login/weixin/callback`,
        options: {
            method: 'POST',
            body: dictToFormData({
                code: code,
                state: state
            }),
        },
    },
});

// 微信登录
export const weChatLogin = (code: string | number, state: any) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_weChatLogin(code, state));
};

const _loadScopeAndState = (): ThunkAction => ({
    params: {
        stateKeys: ['userData','baseInfo'],
    },
    [CALL_API]: {
        type: 'GET_LOGIN_INFO_USER',
        endpoint: `user/login/weixin/params`,
    },
});

const _logout = (): ThunkAction => ({
    params: {
        stateKeys: ['userData'],
    },
    [CALL_API]: {
        type: 'POST_LOGOUT_USER',
        endpoint: 'user/logout',
        options: {
            method: 'POST',
            body: dictToFormData({}),
        },
    },
});

// 用户退出
export const logout = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_logout());
};

// 获取微信登录的scope和state
export const loadScopeAndState = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadScopeAndState());
};

const _checkSignIn = (): ThunkAction => ({
    params: {
        stateKeys: ['userData','signIn'],
    },
    [CALL_API]: {
        type: 'CHECK_SIGN_IN_USER',
        endpoint: `user/check-sign-in`,
    },
});

// 检测签到
export const checkSignIn = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_checkSignIn());
};

const _userSignIn = (): ThunkAction => ({
    params: {
        stateKeys: ['userData','signIn'],
    },
    [CALL_API]: {
        type: 'POST_SIGN_IN_USER',
        endpoint: `user/sign-in`,
        options: {
            method: 'POST',
            body: dictToFormData({}),
        },
    },
});

// 签到
export const userSignIn = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_userSignIn());
};

// 开通VIP
const _localVipData = (): ThunkAction => ({
    params: {
        stateKeys: ['userData','openVip'],
    },
    [CALL_API]: {
        type: 'POST_OPENVIP_USER',
        endpoint: `user/Recharge_vip_v2`,
        options: {
            method: 'POST',
            body: dictToFormData({})
        }
    },
});

export const VipData = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_localVipData());
};

// 我的信息
const _localMyData = (): ThunkAction => ({
    params: {
        stateKeys: ['userData','myData'],
    },
    [CALL_API]: {
        type: 'GET_MYDATA_INFO_USER',
        endpoint: `user/my`,
    },
});

export const MyData = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_localMyData());
};

// 充值码验证
const _chargeCode=(agentId, code):ThunkAction=>({
    params:{
        stateKeys: ['userData','codeInfo'],
    },
    [CALL_API]: {
        type: 'POST_RECHARGE_USER',
        endpoint: `user/recharge_v2`,
        options: {
            method: 'POST',
            body: dictToFormData({
                agent_id: agentId,
                code: code
            }),
        },
    },
});


// 书币验证码验证
export const ChargeCode = (agentId: string | number, code:string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_chargeCode(agentId, code));
};

// 申请代理
const _localApplyAgent = (page:any): ThunkAction => ({
    params: {
        messageKeys:page,
        stateKeys: ['userData','applyAgent'],
    },
    [CALL_API]: {
        type: 'POST_APPLYAGENT_USER',
        endpoint: `user/agent_apply_init`,
        options: {
            method: 'POST',
            body: dictToFormData({})
        }
    },
});

export const SubmitApply = (page:any) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_localApplyAgent(page));
};

// 发送验证码
const _localSendVercode = (mobile): ThunkAction => ({
    params: {
        stateKeys: ['userData','sendVercode'],
    },
    [CALL_API]: {
        type: 'POST_SENDVERCODE_USER',
        endpoint: `user/mobile/send_verify_code`,
        options: {
            method: 'POST',
            body: dictToFormData({
                mobile: mobile
            })
        }
    },
});

export const SendVercode = (mobile: number ) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_localSendVercode(mobile));
};

// 代理验证
const _localApplyText = (mobile,vcode): ThunkAction => ({
    params: {
        stateKeys: ['userData','applyText'],
    },
    [CALL_API]: {
        type: 'POST_APPLYTEXT_USER',
        endpoint: `user/agent_apply`,
        options: {
            method: 'POST',
            body: dictToFormData({
                mobile : mobile,
                vcode : vcode,
            })
        }
    },
});
export const ApplyText = (mobile: number ,vcode :number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_localApplyText(mobile,vcode));
};

// 下拉-刷新最新数据
const _reloadMyComments = (refreshState, currentOffset): ThunkAction => ({
    params: {
        stateKeys: ['userData','commentsData'],
        currentOffset: currentOffset+PAGE_CONTROL,
    },
    [CALL_API]: {
        type: 'RELOAD_COMMENTS_USER',
        endpoint:`book/my-comments?limit=${PAGE_CONTROL}&offset=${currentOffset}`,
        refreshState: refreshState
    },
});

export const reloadMyComments = (
    refreshState: number | string,
    currentOffset: number = 0,
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_reloadMyComments(refreshState, currentOffset));
};

// 上拉加载更多
const _loadMyComments = (refreshState, currentOffset): ThunkAction => ({
    params: {
        stateKeys: ['userData','commentsData'],
        currentOffset: currentOffset + PAGE_CONTROL,
    },
    [CALL_API]: {
        type: 'LOAD_COMMENTS_USER',
        endpoint:`book/my-comments?limit=${PAGE_CONTROL}&offset=${currentOffset}`,
        refreshState: refreshState
    },
});

export const loadMyComments = (
    refreshState: number | string,
    currentOffset: number = 0,
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadMyComments(refreshState, currentOffset));
};

// 下拉-刷新最新数据
const _reloadHistorical = (refreshState, currentOffset): ThunkAction => ({
    params: {
        stateKeys: ['userData','historicalData'],
        currentOffset: currentOffset+PAGE_CONTROL,
    },
    [CALL_API]: {
        type: 'RELOAD_HISTORICAL_USER',
        endpoint:`book/get-book-reads?limit=${PAGE_CONTROL}&offset=${currentOffset}`,
        refreshState: refreshState
    },
});

export const reloadHistorical = (
    refreshState: number | string,
    currentOffset: number = 0,
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_reloadHistorical(refreshState, currentOffset));
};

// 上拉加载更多
const _loadHistorical = (refreshState, currentOffset): ThunkAction => ({
    params: {
        stateKeys: ['userData','historicalData'],
        currentOffset: currentOffset + PAGE_CONTROL,
    },
    [CALL_API]: {
        type: 'LOAD_HISTORICAL_USER',
        endpoint:`book/get-book-reads?limit=${PAGE_CONTROL}&offset=${currentOffset}`,
        refreshState: refreshState
    },
});

export const loadHistorical = (
    refreshState: number | string,
    currentOffset: number = 0,
) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadHistorical(refreshState, currentOffset));
};

const _deleteUserData = (): ThunkAction => ({
    params: {
        stateKeys: ['userData'],
    },
    type: 'DELETE_USER_DATA',
});

// 删除我的信息 - 本地props记录
export const deleteUserData = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_deleteUserData());
};



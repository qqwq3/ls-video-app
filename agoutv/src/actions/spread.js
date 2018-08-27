'use strict';



import type {ThunkAction, Dispatch, GetState} from "./types";
import {CALL_API} from "../Constants";

const util = require('../common/Util');

const _loadDevice = (): ThunkAction => ({
    params: {
        stateKeys: ['device'],
    },
    [CALL_API]: {
        type: 'LOAD_SP_DEVICE',
        endpoint: `spread/get_device?rn=` + Math.random(),
    },
});

/**
 * 加载终端信息
 */
export const loadDevice = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadDevice());
};

const _bindInvite = (instanceUniqueId: string): ThunkAction => ({
    params: {
        stateKeys: ['device'],
        messageKey: 'bind',
    },
    [CALL_API]: {
        type: 'BIND_SP_INVITE',
        endpoint: `spread/exchange`,
        options: {
            method: 'post',
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


const _switchAccount = (deviceEncodedUniqueId: string): ThunkAction => ({
    params: {
        stateKeys: ['device'],
        messageKey: 'switch',
    },
    [CALL_API]: {
        type: 'SWITCH_SP_ACCOUNT',
        endpoint: `spread/switch`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                code: deviceEncodedUniqueId,
            }),
        },
    },
});

/**
 * 切换账户
 * @param deviceEncodedUniqueId 经过编码的设备唯一码
 */
export const switchAccount = (deviceEncodedUniqueId: string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_switchAccount(deviceEncodedUniqueId));
};
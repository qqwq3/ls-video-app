
'use strict';

import type {Dispatch, GetState, ThunkAction} from "./types";
import {CALL_API, CALL_STORAGE} from "../Constants";
import {safeCallApi} from "../middlewares/api";
const util = require('../common/Util');
import * as cryptor from '../common/Cryptor';


/////////////////////收入排行榜////////////////////////////////
const weekRankAction = (sortType:string) : ThunkAction => ({
    params: {
        stateKeys: ['rank'],
        messageKey: sortType,
    },
    [CALL_API]: {
        type: 'INCOME_RANK_WALLET',
        endpoint: `user/top_list?sort_type=${sortType}`,
        // options: {
        //     method: 'get',
        //     body: util.dictToFormData({
        //         sort_type:sortType,
        //     }),
        // },
    },
});

export const incomeRank = (sortType:string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(weekRankAction(sortType));
};



export const loadTxConfig = async (amount: number) => {
    // 时钟加密计算
    let keys = await cryptor.clockSyncEncrypt(amount, await storage.load({ key: 'IMEI' }));
    return safeCallApi(`user/withdraw?amount=${amount}&key=${keys.key}&skey=${keys.skey}`);
};


const _withdraw = (amount: number,type:string): ThunkAction => ({
    params: {
        stateKeys: ['withdraw'],
        messageKey: "txData",
    },
    [CALL_API]: {
        type: 'WITHDRAW_WALLET',
        endpoint: `user/withdraw`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                amount: amount,
                type:type,
            }),
        },
    },
});

export const withdraw = (amount: number,type:string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_withdraw(amount,type));
};



















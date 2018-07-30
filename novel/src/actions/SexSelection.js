
'use strict';

import { ThunkAction, Dispatch, GetState } from "../container/Types";
import { CALL_API } from "../common/Keys";
import { dictToFormData } from '../common/Tool';

const _submitSex = (frequency): ThunkAction => ({
    params: {
        stateKeys: ['select'],
        sex: frequency
    },
    [CALL_API]: {
        type: 'POST_SEX',
        endpoint: `spread/choose_frequency`,
        options: {
            method: 'POST',
            body: dictToFormData({
                frequency: frequency
            }),
        },
    },
});

// 选择性别
export const submitSex = (frequency: string | number = 0) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_submitSex(frequency));
};




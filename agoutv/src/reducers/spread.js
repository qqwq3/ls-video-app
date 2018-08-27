'use strict';

import type {Action} from "../actions/types";
import Immutable from 'immutable';

const util = require('../common/Util');

const initialState = Immutable.fromJS({
    device: {
        timeUpdated: 0,
        bind: {
            timeUpdated: 0,
        },
    },
});


const spread = (state = initialState, action: Action) => {
    if (action.type.indexOf('_SP_') > 0) {
        state = Immutable.fromJS(state.toJS());

        switch (action.type) {
            case 'LOAD_SP_DEVICE_REQUEST':
                return state.setIn(action.params.stateKeys.concat(['isLoading']), true);

            case 'SWITCH_SP_ACCOUNT_FAILURE':

            case 'BIND_SP_INVITE_FAILURE':
                //console.log(action.type, action);
                return state.mergeDeepIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    [action.params.messageKey]: {
                        ...util.safeError(action.error),
                        timeUpdated: Date.now(),
                    },
                });

            case 'LOAD_SP_DEVICE_FAILURE':
                return state.updateIn(action.params.stateKeys, m => {
                    return {
                        ...util.safeError(action.error),
                        timeUpdated: Date.now(),
                        isLoading: false,
                    };
                });

            case 'SWITCH_SP_ACCOUNT_SUCCESS':

            case 'BIND_SP_INVITE_SUCCESS':
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

            case 'LOAD_SP_DEVICE_SUCCESS':
                global.launchSettings.spi.merge(action.response.data);
                return state.setIn(action.params.stateKeys, { code: 0, isLoading: false, timeUpdated: Date.now() });
        }
    }
    return state;
};

module.exports = spread;
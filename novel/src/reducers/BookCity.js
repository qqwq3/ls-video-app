
'use strict';

import Immutable from 'immutable';
import { Action } from "../container/Types";

const initialState = Immutable.fromJS({

});

const bookCity = (state = initialState, action: Action) => {
    // 请求成功统一处理
    if(action.type.indexOf('_CITY') > 0){
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = ['error'];
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            // 书城
            case 'GET_BOOK_CITY_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    ...action.response
                });
        }

        // 请求失败统一处理
        if (action.type.endsWith('_FAILURE')) {
            let stateKeys = ['error'];
            let command = action.type.split('_').splice(-1)[0];

            switch (command) {
                case 'FAILURE':
                    return state.setIn(stateKeys,{
                        timeUpdated: Date.now(),
                        ...action.error
                    });
            }
        }
    }

    return state;
};

export default bookCity;





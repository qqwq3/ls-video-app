
'use strict';

import Immutable from 'immutable';
import { Action } from "../container/Types";
import { saveMaleOrFemaleStatus } from "../common/Storage";

const initialState = Immutable.fromJS({

});

const sexSelection = (state = initialState, action: Action) => {
    // 请求成功统一处理
    if(action.type.indexOf('_SEX') > 0){
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        // let errorKey = ['error'];
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            case 'POST_SEX_SUCCESS':
                saveMaleOrFemaleStatus && saveMaleOrFemaleStatus({'maleOrFemale' : action.params.sex})
                return state.setIn(action.params.stateKeys, {
                    timeUpdated: Date.now(),
                    ...action.response
                });
        }

        // 请求失败统一处理
        if (action.type.endsWith('_FAILURE')) {
            // let stateKeys = ['error'];
            let stateKeys = action.params.stateKeys.concat(['error']);
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

export default sexSelection;





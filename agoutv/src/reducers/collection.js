'use strict';

import type {Action} from "../actions/types";
import { RefreshState } from "../Constants";
import Immutable from 'immutable';

const initialState = Immutable.fromJS({
});


const explorePage = (state = initialState, action: Action) => {
    if (action.type.indexOf('_COLLECTION') > 0) {
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            case 'RELOAD_COLLECTIONS_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    //...m.toJS(),
                    ...action.response.data,
                    updateTime: Date.now(),
                    refreshState: RefreshState.Idle,
                    ...action.params,
                });

            case 'LOAD_COLLECTIONS_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    if (typeof m === 'undefined' || !m.has('records')) {
                        return {
                            //...m.toJS(),
                            ...action.response.data,
                            updateTime: Date.now(),
                            refreshState: RefreshState.Idle,
                            ...action.params,

                        };
                    }
                    let records = m.get('records').concat(action.response.data.records);
                    return {
                        //...m.toJS(),
                        ...action.response.data,
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        records: records.toJS(),
                        ...action.params,
                    };
                });

            case 'DELETE_COLLECTIONS_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    let records = m.get('records').toJS();
                    let paramSerialsId = action.params.seriaId;
                    let newRecords = records.filter(
                        item => item.movieId !== paramSerialsId
                    );
                    return{
                        ...m.toJS(),
                        updateTime: Date.now(),
                        records : newRecords,
                        refreshState: RefreshState.Idle,
                    }
                });
        }

        if (action.type.endsWith('_REQUEST') || action.type.endsWith('_FAILURE')) {
            let stateKeys = action.params.stateKeys.concat(['refreshState']);
            let command = action.type.split('_').splice(-1)[0];
            switch (command) {
                case 'FAILURE':
                    let rs = RefreshState.Failure;
                    if (action.error.code === 404) {
                        rs = action.type.startsWith('RELOAD_') ? RefreshState.NoMoreDataHeader : RefreshState.NoMoreDataFooter;
                    }
                    return state.setIn(stateKeys, rs);
                case 'REQUEST':
                    return state.setIn(stateKeys
                        , action.type.startsWith('RELOAD_') ? RefreshState.HeaderRefreshing : RefreshState.FooterRefreshing);
            }
        }
    }
    return state;
};

module.exports = explorePage;
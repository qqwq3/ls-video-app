
'use strict';

import { CALL_STORAGE } from "./Keys";

const storageAPI = require('../common/Storage');

const callApi = async (method, params) => {
    return await storageAPI[method](params);
};

export default store => next => action => {
    const callAPI = action[CALL_STORAGE];
    if (typeof callAPI === 'undefined') {
        return next(action);
    }

    let { method } = callAPI;
    const {params, type} = callAPI;

    if (typeof method === 'function') {
        method = method(store.getState());
    }
    if (typeof type !== 'string') {
        throw new Error('Expected action type to be string.');
    }

    const actionWith = data => {
        const finalAction = Object.assign({}, action, data);
        delete finalAction[CALL_STORAGE];
        return finalAction;
    };

    next(actionWith({ type: type + '_REQUEST' }));

    return callApi(method, params).then(
        data => next(actionWith({
            data,
            type: type + '_SUCCESS',
        })),
        error => next(actionWith({
            type: type + '_FAILURE',
            error: error.message || 'Some other mistakes.'
        }))
    );
};




































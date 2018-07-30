
'use strict';

import { ThunkAction, Dispatch, GetState } from "../container/Types";
import { CALL_API } from "../common/Keys";
import { dictToFormData } from '../common/Tool';

const _localQuestionType = (): ThunkAction => ({
    params: {
        stateKeys: ['feedback','questionType'],
    },
    [CALL_API]: {
        type: 'GET_FEEDBACK_LIST',
        endpoint: `user/problem_list`
    },
});

export const loadFeedback = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_localQuestionType());
};

const _localSubmitQuestion = (phone, problemtype, content): ThunkAction => ({
    params: {
        stateKeys: ['feedback','submitQuestion'],
    },
    [CALL_API]: {
        type: 'POST_FEEDBACK_LIST',
        endpoint: `user/submit_problem`,
        options: {
            method: 'POST',
            body: dictToFormData({
                phone: phone,
                problem_type: problemtype,
                content: content,
            })
        }
    },
});

export const SubmitFeedback = (phone: string | number, problemtype: string, content: any) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_localSubmitQuestion(phone, problemtype, content));
};
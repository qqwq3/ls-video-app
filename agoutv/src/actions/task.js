
'use strict';

import type { Dispatch, GetState, ThunkAction } from "./types";
import { CALL_API, CALL_STORAGE } from "../Constants";
const util = require('../common/Util');


// 初始化宝箱
const initTBoxAction = () : ThunkAction => ({
    params: {
        stateKeys: ['box'],
    },
    [CALL_API]: {
        type: 'INIT_BOX_TASK',
        endpoint: `user/open_box`,
    },
});

export const initTBox = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(initTBoxAction());
};


// 打开宝箱
const _openTBox = (taskId: number): ThunkAction => ({
    params: {
        stateKeys: ['openBox']
    },
    [CALL_API]: {
        type: 'OPEN_BOX_TASK',
        endpoint: `user/open_box`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                task_id: taskId,
            }),
        },
    },
});

export const openTBox = (taskId: number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_openTBox(taskId));
};

// 初始化签到
const initSignAction = (): ThunkAction => ({
    params: {
        stateKeys: ['signInit'],
    },
    [CALL_API]: {
        type: 'INIT_SIGN_TASK',
        endpoint: `user/check-sign-in`,
    },
});

export const initSign = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(initSignAction());
};

// 签到
const _sign = (): ThunkAction => ({
    params: {
        stateKeys: ['signPost'],
    },
    [CALL_API]: {
        type: 'POST_SIGN_TASK',
        endpoint: `user/sign-in`,
        options: {
            method: 'post',
            body: util.dictToFormData({}),
        },
    },
});

export const sign = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_sign());
};

// 任务中心
const _loadTaskCenterInfo = (): ThunkAction => ({
    params:{
        stateKeys: ['taskCenterInfo'],
    },
    [CALL_API]: {
        type: 'LOAD_INFO_TASK',
        endpoint: `user/task_center`,
        method:'GET',
    },
});

export const loadTaskCenterInfo = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadTaskCenterInfo());
};

// 等级特权
const _loadLevelPrivileges = (): ThunkAction => ({
    params:{
        stateKeys: ['taskLevelInfo'],
    },
    [CALL_API]:{
        type: 'LOAD_LEVEL_INFO_TASK',
        endpoint: `user/level_privilege`,
        method:'GET'
    },
});

export const loadLevelPrivileges = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadLevelPrivileges());
};

// 答题
const _loadAnswerQuestions = (): ThunkAction => ({
    params:{
        stateKeys: ['answerQuestions'],
    },
    [CALL_API]:{
        type: 'LOAD_ANSWER_QUESTIONS_TASK',
        endpoint: `user/task_questions`,
        method:'GET'
    },
});

export const loadAnswerQuestions = () => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadAnswerQuestions());
};

// 提交答题答案
const _sumbitAnswer = (answerJosn:string): ThunkAction => ({
    params:{
        stateKeys: ['submitAnswer'],
    },
    [CALL_API]:{
        type: 'SUBMIT_ANSWER_TASK',
        endpoint: `user/answer_questions`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                answer_josn:answerJosn,
            }),
        },
    },
});

export const sumbitAnswer = (answerJosn:string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_sumbitAnswer(answerJosn));
};



// 任务中心列表去领取
const _toPickUp = (id): ThunkAction => ({
    params:{
        stateKeys: ['receive'],
    },
    [CALL_API]:{
        type: 'SUBMIT_RECEIVE_TASK',
        endpoint: `user/receive_task`,
        options: {
            method: 'POST',
            body: util.dictToFormData({
                task_id: id
            }),
        },
    },
});

export const toPickUp = (id: string | number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_toPickUp(id));
};


// 公共方法
const _addTask = (type, seconds, movie_id, serials_src_id): ThunkAction => ({
    params:{
        stateKeys: ['taskPublic'],
    },
    [CALL_API]:{
        type: 'ADD_PUBLIC_TASK',
        endpoint: `task/add_task/` + type,
        options: seconds ? {
            method: 'POST',
            body: util.dictToFormData({
                seconds: seconds,
                movie_id: movie_id,
                serials_src_id: serials_src_id
            })} : {method: 'POST'}
    },
});

export const addTask = (type: string, seconds?: string | number, movie_id?: string | number, serials_src_id?: string | number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_addTask(type, seconds, movie_id, serials_src_id));
};













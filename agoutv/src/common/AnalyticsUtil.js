'use strict';

let UMNative = require('react-native').NativeModules.UMAnalyticsModule;

module.exports = {
    pageStart: UMNative.onPageStart,
    pageEnd: UMNative.onPageEnd,
    logIn: UMNative.profileSignInWithPUID,
    logInWithProvider: UMNative.profileSignInWithPUIDWithProvider,
    logOut: UMNative.profileSignOff,
    event: UMNative.onEvent,
};
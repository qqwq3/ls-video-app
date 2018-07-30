
'use strict';

import { combineReducers } from 'redux-immutable';

import user from './User';
import bookshelf from './Bookshelf';
import classification from './Classification';
import rankings from './Rankings';
import bookCity from './BookCity';
import feedback from './Feedback';
import reader from './Reader';
import sexSelection from './SexSelection';
import details from './Details';
import chapterDirectory from './ChapterDirectory';
import local from './LocalReducer';

const rootReducer = combineReducers({
    user,
    bookshelf,
    classification,
    rankings,
    bookCity,
    feedback,
    reader,
    sexSelection,
    details,
    chapterDirectory,
    local
});

export default rootReducer;












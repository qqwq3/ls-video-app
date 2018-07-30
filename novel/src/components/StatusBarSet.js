
'use strict';

import React,{ Component } from 'react';
import { StatusBar } from 'react-native';

type Props = {
    translucent?: boolean,
    backgroundColor?: string,
    barStyle: ?string,
    animated?: boolean,
    hidden?: boolean
};

type State = {};

class StatusBarSet extends Component<Props, State>{
    static defaultProps = {
        translucent: true,
        backgroundColor: '#FFFFFF',
        barStyle: 'dark-content',
        animated: true,
        hidden: false,
    };
    render(){
        const { translucent, backgroundColor, barStyle, animated, hidden } = this.props;

        return (
            <StatusBar
                hidden={hidden}
                translucent={translucent}
                backgroundColor={backgroundColor}
                barStyle={barStyle}
                animated={animated}
            />
        );
    }
}

export default StatusBarSet;








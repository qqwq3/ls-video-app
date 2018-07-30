
/*加载菊花 - 公共*/

'use strict';

import React,{ PureComponent } from 'react';
import { ActivityIndicator } from 'react-native';

type Props = {
    indicatorColor?: ?string,
    indicatorSize?: ?string,
    indicatorAnimate?: ?boolean
};

type State = {};

class Chrysanthemum extends PureComponent<Props, State>{
    static defaultProps = {
        indicatorColor: '#f3916b',
        indicatorSize: 'small', // large
        indicatorAnimate: true
    };
    constructor(props){
        super(props);
        this.state = {};
    }
    render(){
        const { indicatorColor, indicatorSize, indicatorAnimate } = this.props;

        return (
            <ActivityIndicator
                animating={indicatorAnimate}
                color={indicatorColor}
                size={indicatorSize}
            />
        );
    }
}

export default Chrysanthemum;




























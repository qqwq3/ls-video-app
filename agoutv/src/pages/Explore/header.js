import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Image,
    Text,
    View,
    TextInput,
} from 'react-native'


const styles = StyleSheet.create({
    searchIconStyle: {
        width: 20,
        height: 20,
        marginLeft: 15,
    },
    right: {
        marginLeft: 15,
    },
});

export class ExploreSearchButton extends React.Component {
    render() {
        return (
            <TouchableOpacity activeOpacity={ 0.75 } {...this.props}>
                <Image
                    source={require('../imgs/icon_search.png')}
                    style={styles.searchIconStyle}
                />
            </TouchableOpacity>
        );
    }
}

// export class ExploreFilterButton extends React.Component {
//     render() {
//         return (
//             <TouchableOpacity style={styles.filterContainerStyle} activeOpacity={ 0.75 } {...this.props}>
//                 <Image
//                     source={require('../imgs/icon_filter_sel.png')}
//                     style={styles.filterIconStyle}
//                 />
//             </TouchableOpacity>
//         );
//     }
// }

export class CancelButton extends React.Component {
    render () {
        return (
            <TouchableOpacity style={styles.left} {...this.props}>
                <Text style={{fontSize:15,color:'#c0c0c0' }}>取消</Text>
            </TouchableOpacity>
        );
    }
}
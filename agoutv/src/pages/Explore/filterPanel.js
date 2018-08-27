
import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Text } from 'react-native';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import { RefreshState } from "../../Constants";
import { pixel } from '../../common/tool'

export class FilterPanel extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    static propTypes = {
        categoryObj: PropTypes.object,
    };
    static defaultProps = {

    };
    selectZoneCallBack (option,index) {
        let selectObj = Immutable.Map(this.props.dataRet.selectedObj);
        let ret = selectObj.setIn(['zone'], option.id, index);
        this.props.reLoadWithFilters(RefreshState.HeaderRefreshing, ret.toJS());
    }
    selectYearCallBack (option,index) {
        let selectObj = Immutable.Map(this.props.dataRet.selectedObj);
        let ret = selectObj.setIn(['year'], option.id, index);
        this.props.reLoadWithFilters(RefreshState.HeaderRefreshing, ret.toJS());
    }
    selectHotCallBack (option,index) {
        let selectObj = Immutable.Map(this.props.dataRet.selectedObj);
        let ret = selectObj.setIn(['hot'], option.id, index );
        this.props.reLoadWithFilters(RefreshState.HeaderRefreshing, ret.toJS());
    }
    render() {
        const { categoryObj, navigation } = this.props;
        const catType = (navigation.state && navigation.state.params && navigation.state.params.id) || 0;

        if (!categoryObj || !categoryObj.zone || !categoryObj.genre || !categoryObj.hot){
            return null;
        }

        return (
            <View style={[styles.filterContainerStyle]}>
                {catType === 4 ? null : <SegmentedControls records={categoryObj.zone}  selectItemCallBack={this.selectZoneCallBack.bind(this)} />}
                <SegmentedControls records={categoryObj.year}  selectItemCallBack={this.selectYearCallBack.bind(this)} />
                <SegmentedControls records={categoryObj.hot}   selectItemCallBack={this.selectHotCallBack.bind(this)}  />
            </View>
        );
    }
}

export class SegmentedControls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            innerIndex: 0,
        };
    }
    static propTypes = {
        records: PropTypes.arrayOf(PropTypes.object),
        selectItemCallBack: PropTypes.func.isRequired,
    };
    selectOption({item,index}){
        const { selectItemCallBack } = this.props;
        this.setState({innerIndex: index});
        selectItemCallBack && typeof selectItemCallBack === 'function' && selectItemCallBack(item,index);
    }
    // 渲染
    renderItem({item,index}){
        const { innerIndex } = this.state;
        let viewStyle = innerIndex === index ? styles.selectedCellContainer : styles.selectedCellContainer;
        let TouchableOpacityStyle = innerIndex === index ? styles.selectedCell : styles.unSelectedCell;
        let TextStyle = innerIndex === index ? styles.selectedCellText : styles.unSelectedCellText;

        return (
            <View key={index} style={viewStyle}>
                <TouchableOpacity activeOpacity={0.5} style={TouchableOpacityStyle} onPress={this.selectOption.bind(this,{item,index})}>
                    <Text style={TextStyle} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
            </View>
        );
    }
    // 提高组件性能
    getItemLayout(item, index){
        let height = 70;
        return {length: height, offset: height * index, index};
    }
    render() {
        const { records } = this.props;

        return (
            <View style={styles.SegmentedControlsContent}>
                <FlatList
                    data={records}
                    keyExtractor={(item,index) => item.id}
                    renderItem={this.renderItem.bind(this)}
                    getItemLayout={this.getItemLayout.bind(this)}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    horizontal={true}
                    style={styles.SegmentedControlsFlatList}
                    initialNumToRender={20}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    SegmentedControlsContent:{
        flexDirection: 'row',
        backgroundColor: '#fff'
    },
    SegmentedControlsFlatList:{
        flex: 1,
        backgroundColor:'#ffffff'
    },
    filterContainerStyle: {
        paddingTop:8,
        paddingBottom:14,
        backgroundColor:'#fff',
        borderBottomWidth:1/pixel,
        borderBottomColor:'#dcdcdc',
        marginBottom: 6,
        position:'relative',
        zIndex:0,
        marginHorizontal:6,
    },
    divider: {
        height: 5,
        backgroundColor: '#efefef'
    },
    selectedCellContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
    },
    selectedCell: {
        borderColor: 'rgb(0,117,248)',
        borderWidth: 0.5,
        borderRadius: 12,
        width: 70,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    selectedCellText: {
        fontSize: 12,
        color: 'rgb(0,117,248)',
        alignContent: 'center',
    },
    unSelectedCellContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
    },
    unSelectedCell: {
        borderColor: 'rgb(175,175,192)',
        borderWidth: 0,
        borderRadius: 5,
        width: 70,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unSelectedCellText: {
        fontSize: 12,
        color: '#c0c0c0',
        alignContent: 'center',
    },
});
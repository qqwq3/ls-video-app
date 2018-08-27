// 'use strict';
//
// import React from 'react';
// import {
//     View,
//     TextInput,
//     Image,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
// } from 'react-native';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import Immutable from 'immutable';
// import { BackwardButton } from "../../components/Header";
// import XingrenFlatList from '../../components/XingrenFlatList';
//
// import { MovieScreen } from "../movie/list";
// import {
//     searchVideos,
//     searchVideos,
// } from '../../actions/video';
// import { RefreshState } from "../../Constants";
//
// const util = require('../../common/Util');
//
// class ExploreSearchPage extends React.Component {
//     static navigationOptions = ({navigation}) => ({
//         header: null,
//     });
//
//     constructor(props) {
//         super(props);
//
//         // 是否显示结果
//         this.showResult = false;
//         if (typeof this.props.navigation.state.params !== 'undefined') {
//             this.showResult = !!this.props.navigation.state.params.stackBack;
//         }
//
//         this.state = { history: [] };
//
//     }
//
//     async componentDidMount() {
//     }
//
//     async componentWillReceiveProps(nextProps) {
//     }
//
//     componentWillUnmount() {
//     }
//
//     _onSearch = (word) => {
//         if (typeof word !== 'undefined' && word && word.trim()) {
//             this.showResult = true;
//             this.props.searchVideos(RefreshState.HeaderRefreshing, word.trim());
//         }
//     };
//
//     _renderEmpty = () => {
//         return (
//             (this.props.word ? <View style={styles.emptyContainer}><Text style={styles.emptyText}>没有「{this.props.word}」相关内容</Text></View> : null)
//         );
//     };
//
//     _renderMovieList = () => {
//         return <MovieList {...this.props} ListEmptyComponent={this._renderEmpty} autoRefresh={false} />;
//     };
//
//     _renderHistory = () => {
//         return (
//             <View style={styles.historyContainer}>
//                 <View style={styles.pageTitleContainer}>
//                     <Text style={styles.pageTitle}>搜索历史</Text>
//                 </View>
//                 <XingrenFlatList
//                     data={this.state.history}
//                     renderItem={({item}) => (
//                         <TouchableOpacity style={styles.keywordContainer} onPress={() => this._onSearch(item)}>
//                             <Text style={styles.keyword} numberOfLines={1}>{item}</Text>
//                         </TouchableOpacity>
//                     ) }
//                     keyExtractor={item => item}
//                     getItemLayout={(data, index) => (
//                         {length: 30, offset: 30 * index, index}
//                     )}
//                     columnWrapperStyle={styles.rowStyle}
//                     style={styles.listStyle}
//                     numColumns={parseInt((util.SCREEN_WIDTH - 15) / 85)}
//                 />
//             </View>
//         );
//     };
//
//     _renderHeader = () => {
//         return (
//             <View style={styles.header}>
//                 <BackwardButton style={styles.backButton} onPress={() => this.props.navigation.goBack()} />
//                 <View style={styles.searchInput}>
//                     <Image
//                         source={require('../imgs/icon_search_category.png')}
//                         style={styles.searchIcon}
//                     />
//                     <TextInput
//                         style={styles.searchBox}
//                         placeholder="请输入演员、导演或制片商"
//                         placeholderTextColor="#808080"
//                         underlineColorAndroid="transparent"
//                         keyboardType="web-search"
//                         returnKeyType="search"
//                         defaultValue={this.showResult ? this.props.word : null}
//                         onSubmitEditing={(e) => {
//                             this._onSearch(e.nativeEvent.text);
//                         }}
//                         onChangeText={(text) => {
//                             if (!text) {
//                                 this._resetState();
//                             }
//                         }}
//                     />
//                     <TouchableOpacity/>
//                 </View>
//             </View>
//         );
//     };
//
//     render() {
//         return (
//             <View style={styles.container}>
//                 {this._renderHeader()}
//                 {this.showResult ? this._renderMovieList() : this._renderHistory()}
//             </View>
//         );
//     }
// }
//
// class MovieList extends MovieScreen {
//
//     onFooterRefresh(videoType, page, refreshState:number) {
//         this.props.searchVideos(refreshState, this.props.word, page);
//     }
//
//     onHeaderRefresh(videoType, refreshState:number) {
//         this.props.searchVideos(refreshState, this.props.word);
//     }
//
//     getType() {
//         return 'searchVideos';
//     }
// }
//
// const mapStateToProps = (state, ownProps) => {
//     let data = state.getIn(['video', 'searchVideos']);
//     if (Immutable.Map.isMap(data)) {
//         data = data.toJS();
//     }
//
//     return {
//         ...ownProps,
//         ...data,
//     };
// };
//
// export default connect(mapStateToProps, {
//     searchVideos,
//     searchVideos,
// })(ExploreSearchPage);
//
//
// const styles = StyleSheet.create({
//     header: {
//         height: 50,
//         backgroundColor: '#0f0f0f',
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     backButton: {
//         marginHorizontal: 15,
//     },
//     searchInput: {
//         height: 29,
//         flex: 1,
//         backgroundColor: '#fff',
//         borderColor: '#fff',
//         borderWidth: 1,
//         borderRadius: 2,
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 0,
//         marginTop: 10,
//         marginBottom: 10,
//         marginRight: 31,
//     },
//     searchIcon: {
//         width: 15,
//         height: 16,
//         marginLeft: 10,
//         marginRight: 10,
//     },
//     searchBox: {
//         flex: 1,
//         fontSize: 12,
//         padding: 0,
//     },
//     container: {
//         backgroundColor: '#242424',
//         flex: 1,
//     },
//     pageTitleContainer: {
//         marginTop: 10,
//         height: 40,
//         justifyContent: 'center',
//         borderBottomWidth: 1,
//         borderBottomColor: '#3d3d3d',
//     },
//     pageTitle: {
//         fontSize: 12,
//         color: '#808080',
//         marginLeft: 15,
//     },
//     listStyle: {
//         marginTop: 20,
//         marginLeft: 15,
//     },
//     keywordContainer: {
//         width: 70,
//         height: 30,
//         padding: 7,
//         borderWidth: 1,
//         borderColor: '#eb832e',
//         borderRadius: 2,
//         marginRight: 15,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 10,
//     },
//     keyword: {
//         color: '#eb832e',
//         fontSize: 12,
//         textAlign: 'center',
//     },
//     emptyContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: util.SCREEN_HEIGHT - 50,
//     },
//     emptyText: {
//         fontSize: 12,
//         textAlign: 'center',
//         color: '#fff',
//     },
// });
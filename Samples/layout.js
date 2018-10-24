/* import react modules  */
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route, Link, Redirect, withRouter } from 'react-router-dom';
import Alert from 'react-s-alert';
import axios from 'axios';
import BlockUi from 'react-block-ui';
import { AnimatedSwitch } from 'react-router-transition';

import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css';

/* import helper file */
import Constants from './config/constants';
import Message from './config/messages';
import {setCookie, getCookie, deleteCookie, updateUserValues} from './config/helper';

/* import components */
import ComingSoon from './components/blocks/comingSoon';
import Header from './components/blocks/header';
import Home from './components/home';
import SingleFeed from './components/singleFeed';
import BecomeSubscriber from './components/becomeSubscriber';
import FeedSinglePost from './components/postsData/feedSinglePost';
import CreatorSinglePost from './components/postsData/creatorSinglePost';

/* import auth components */
import SignUp from './components/auth/signup';
import SignIn from './components/auth/signin';
import BecomeCreator from './components/auth/becomeCreator';
import UserVerification from './components/auth/userVerification';
import ForgotPassword from './components/auth/forgotPassword'; 
import ForgotPasswordVerification from './components/auth/forgotPasswordVerification'; 
import ResetPassword from './components/auth/resetPassword'; 
import PublicCreatorSignup from './components/auth/publicCreatorSignup'; 
import PublicCreatorSignin from './components/auth/publicCreatorSignin'; 

/* import profile components */
import CreatorProfileScreen from './components/creatorProfileScreen';
import OtherUserProfile from './components/otherUserProfile/otherUserProfile';
import UserProfile from './components/userProfile';

/* import feed screen components */
import Feeds from './components/feed/feeds';
import Friends from './components/feed/friends/friends';
// import SearchFriends from './components/feed/searchFriends';
import Subscriptions from './components/feed/subscriptions';
import MyGallery from './components/feed/myGallery';
import FindCreators from './components/feed/findCreator/findCreators';
import SuggestedCreatorsList from './components/feed/suggestedCreator/suggestedCreatorsListing';
import RecentActiveCreatorsList from './components/feed/activeCreator/recentActiveCreatorsListing';
import FeedMessages from './components/feed/feedMessages';
import NewMessages from './components/feed/newMessages';
import SingleMessage from './components/feed/singleMessage';

/* import creator signup form components */
import CreatorSignupForm from './components/creatorSignupForm/creatorSignup';
import Congratulations from './components/creatorSignupForm/congratulations';

/* import footer components */
import Press from './components/footerLinks/press';
import Text from './components/text';
import Blog from './components/footerLinks/blog';
import Support from './components/footerLinks/support';
import CreatorGuidelines from './components/footerLinks/creatorGuidelines';
import CommunityGuide from './components/footerLinks/communityGuide';
import AffiliateCommissions from './components/footerLinks/affiliateCommissions';
import TermsOfUse from './components/footerLinks/termsOfUse';
import PrivacyPolicy from './components/footerLinks/privacyPolicy';
import Exempt2257 from './components/footerLinks/exempt2257';
import Creator from './components/footerLinks/creator';
import SingleBlogs from './components/singleBlogs';
import SinglePress from './components/singlePress';
import FooterLinksCategory from './components/categories';

/* import creator dashboard components */
import Marketting from './components/creatorDashboard/marketting';
import Messages from './components/creatorDashboard/messages';
import PageManagement from './components/creatorDashboard/pageManagement';
import CreatorProfile from './components/creatorDashboard/creatorProfile';
import AddPost from './components/creatorDashboard/addPost';
import LiveStream from './components/creatorDashboard/liveStream';

/* import search managed components */      
import ManageBlocking from './components/search/block';
import ManageSearch from './components/search/search';

class Layout extends React.Component {
    constructor(props){
        super(props);
        let token = localStorage.getItem('token');
        let fullname = localStorage.getItem('fullname');
        let email = localStorage.getItem('email');
        let isCreator = localStorage.getItem('isCreator');
        let isProfileCompleted = localStorage.getItem('isProfileCompleted');

        if (token && fullname && email) {
            this.state = {blocking: false, userData: {fullname: fullname, email: email, token: token, isLogin: true}, hideHeader: ['/sign-in', '/sign-up', '/forgot-password', '/terms-of-use ', '/creator-profile', '/creator-messages', '/marketting', '/page-management', '/add-post', '/live-stream', '/user-verification', '/recover/code', '/forgot-password/initiate', '/reset/password'],contentType: true, isCreator:isCreator, isProfileCompleted: isProfileCompleted};
        } else {
            this.state = {blocking: false, userData: {fullname: "", email: "", token: "", isLogin: false}, hideHeader: ['/sign-in', '/sign-up', '/forgot-password', '/terms-of-use', '/creator-profile', '/creator-messages', '/marketting', '/page-management', '/add-post', '/live-stream', '/user-verification', '/recover/code', '/forgot-password/initiate', '/reset/password'],contentType: true, isCreator:isCreator, isProfileCompleted: isProfileCompleted};
        }

        /**** binding to make context of this to class ***/
        this.updateAuthState = this.updateAuthState.bind(this);
        this.logout = this.logout.bind(this);
        this.handleSfwNsfwToggle = this.handleSfwNsfwToggle.bind(this);
    }

    componentWillMount(){
        localStorage.setItem('contentType', this.state.contentType, 365);
    }

    componentDidMount(){
        localStorage.setItem('contentType', this.state.contentType, 365);
    }

    /* get value of token, fullname and email */
    updateAuthState(){
        let token = localStorage.getItem('token');
        let fullname = localStorage.getItem('fullname');
        let email = localStorage.getItem('email');
        let isCreator = localStorage.getItem('isCreator');
        let isProfileCompleted = localStorage.getItem('isProfileCompleted');

        fullname = (fullname) ? fullname : "";
        email = (email) ? email : "";
        let isLogin = (token && fullname && email) ? true : false ;

        this.setState({userData: Object.assign({}, this.state.userData, {fullname: fullname}),userData: Object.assign({}, this.state.userData, {email: email}), userData: Object.assign({}, this.state.userData, {token: token}), userData: Object.assign({}, this.state.userData, {isLogin: isLogin}), isCreator: isCreator, isProfileCompleted: isProfileCompleted });
    }

    /**** logout functionality ****/
    logout(){
        var _that = this;
        _that.setState({ blocking: true});
    
        /***** fetch API for logout starts **********/

        fetch(Constants.SERVER_URL + '/api/v1/auth/logout/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': _that.state.userData.token
            },
        }).then(function (response) {
            let responseData = response.json();
            responseData.then(function (data) {
                if (data.status == 200) {
                    Alert.success('<h4>' + Message.SIGNOUT.SUCCESS + '</h4>', {
                        position: 'top',
                        effect: 'stackslide',
                        beep: false,
                        timeout: 2000
                    });
                    
                    localStorage.clear();
                    _that.updateAuthState();
                    _that.props.history.push("/sign-in");
                } else if (data.status == 401) {
                    localStorage.clear();
                    deleteCookie("id");
                    _that.updateAuthState();
                    _that.props.history.push("/sign-in");
                } else {
                    Alert.success('<h4>' + Message.SIGNOUT.SUCCESS + '</h4>', {
                        position: 'top',
                        effect: 'stackslide',
                        beep: false,
                        timeout: 2000
                    });

                    localStorage.clear();
                    deleteCookie("id");
                    _that.updateAuthState();
                    _that.props.history.push("/sign-in");
                }
            })
        }).catch(function (error) {
            if(navigator.onLine){
                Alert.error('<h4>' + Message.SERVER_CONNECTION_ISSUE + '</h4>', {
                    position: 'top',
                    effect: 'stackslide',
                    beep: false,
                    timeout: 3000
                });
            } else{
                Alert.error('<h4>' + Message.INTERNET_CONNECTION_ISSUE + '</h4>', {
                    position: 'top',
                    effect: 'stackslide',
                    beep: false,
                    timeout: 3000
                });
            }
        });

        /***** fetch API for logout ends **********/
    }

    /**** Content Type Functionality ****/
    handleSfwNsfwToggle(event){
        localStorage.setItem('contentType', !this.state.contentType, 365);
        this.setState({ contentType: !this.state.contentType }); //, contentType: (this.state.contentType)?'NSFW': 'SFW'
    }

    /*** render view ****/
	render(){
        
        const ScrollToTop = () => {
            window.scrollTo(0, 0);
            return null;
        }

        return(
        	<div>
            <BlockUi blocking={this.state.blocking}>
                <Header userData={this.state.userData} hideHeader={this.state.hideHeader} propValue={this.props} isLogin={this.state.userData.isLogin}  handleSfwNsfwToggle={this.handleSfwNsfwToggle} contentType={this.state.contentType} userLogout={this.logout}/>
                <Route component={ScrollToTop} />
                <Switch>
                <AnimatedSwitch
                    atEnter={{ opacity: 0 }}
                    atLeave={{ opacity: 0 }}
                    atActive={{ opacity: 1 }}
                    className="switch-wrapper topswitchwrapper"
                >
                {/* Landing page routes */}
                <Route exact path="/" component={Home} />
                <Route path="/coming-soon" component={ComingSoon} />
                <Route path="/sign-up" component={(props)=>!this.state.userData.isLogin ? (
                    <SignUp updateStateSignup={this.updateAuthState} propValue={this.props}  />
                    ) : (<Redirect to='/user-profile' />) }/>
                <Route path="/sign-in" component={(props)=>!this.state.userData.isLogin ? (
                    <SignIn updateStateSignin={this.updateAuthState} propValue={this.props} />
                    ) : (<Redirect to='/feed' />) } />

                {/* Inner pages routes */}
               
                <Route path="/creator-signup" component={(props)=>!this.state.userData.isLogin ? (
                    <BecomeCreator updateStateCreatorSignup={this.updateAuthState} userLogout={this.logout} propValue={this.props}/>
                    ) : (<Redirect to='/creator'/>) } />
                <Route path="/creator" component={CreatorSignupForm} />
                <Route path="/feed" component={Feeds} /> 
                
                <Route path="/user-profile" component={(props)=>this.state.userData.isLogin ? (
                    <UserProfile propValue={this.props} userLogout={this.logout}/>
                    ) : (<Redirect to='/sign-in' />) } />

                <Route path="/congratulations" component={(props)=>this.state.userData.isLogin ? (
                    <Congratulations />
                    ) : (<Redirect to='/sign-in' />) } />

                {/* feed screen routes */}

                <Route path="/single-feed" component={(props)=>this.state.userData.isLogin ? (
                    <SingleFeed userLogout={this.logout}/>
                    ) : (<Redirect to='/sign-in' />) }/>
                <Route path="/find-creators" component={FindCreators}/>
                
                <Route path="/friends" component={(props)=>this.state.userData.isLogin ? (
                    <Friends userLogout={this.logout} propValue={this.props}/>
                    ) : (<Redirect to='/sign-in' />) }/>
                <Route path="/suggested-creators" component={(props)=>this.state.userData.isLogin ? (
                    <SuggestedCreatorsList userLogout={this.logout} propValue={this.props}/>
                    ) : (<Redirect to='/sign-in' />) }/>
                <Route path="/recent-active-creators" component={(props)=>this.state.userData.isLogin ? (
                    <RecentActiveCreatorsList userLogout={this.logout} propValue={this.props}/>
                    ) : (<Redirect to='/sign-in' />) }/>
                
                <Route path="/subscriptions" component={Subscriptions}/>
                <Route path="/my-gallery" component={MyGallery}/>
                <Route path="/feed-messages" component={FeedMessages}/>
                <Route path="/new-messages" component={NewMessages}/>
                <Route path="/single-messages" component={SingleMessage}/>
                
                {/* Manage Search routes*/}     
                <Route path="/manage-blocking" component={ManageBlocking} />

                {/* Footer links routes*/}
                <Route path="/press" component={Press}/>
                <Route path="/text" component={Text}/>
                <Route path="/blog" component={Blog}/>
                <Route path="/support" component={Support}/>
                <Route path="/creator-guidelines" component={CreatorGuidelines}/>
                <Route path="/community-guide" component={CommunityGuide}/>
                <Route path="/affiliate-commissions" component={AffiliateCommissions}/>
                <Route path="/terms-of-use" component={TermsOfUse}/>
                <Route path="/privacy-policy" component={PrivacyPolicy}/>
                <Route path="/2257-exempt" component={Exempt2257}/>
                <Route path="/become-a-creator" component={Creator}/>
                <Route path="/blog-detail" component={SingleBlogs}/>
                <Route path="/press-detail" component={SinglePress}/>
                <Route path="/categories" component={FooterLinksCategory}/>

                {/* creator dashboard pages routes */}
                <Route path="/creator-profile" component={(props)=>
                    {
                        if(this.state.userData.isLogin){
                            if(this.state.isCreator != 'true'){
                                return ( <Redirect to='/feed' /> )
                            } else if(this.state.isCreator == 'true' && this.state.isProfileCompleted == 'true'){
                                return ( <CreatorProfile propValue={this.props} userLogout={this.logout}/> )
                            } else{
                                return (<Redirect to='/creator/personal-information' />)
                            }
                        } else{
                            return (<Redirect to='/sign-in' />) 
                        }
                    }
                } />
                <Route path="/creator-messages" component={(props)=>
                    {
                        if(this.state.userData.isLogin){
                            if(this.state.isCreator != 'true'){
                                return ( <Redirect to='/feed' /> )
                            } else if(this.state.isCreator == 'true' && this.state.isProfileCompleted == 'true'){
                                return ( <Messages propValue={this.props} userLogout={this.logout}/> )
                            } else{
                                return (<Redirect to='/creator/personal-information' />)
                            }
                        } else{
                            return (<Redirect to='/sign-in' />) 
                        }
                    }
                } />
                <Route path="/marketting" component={(props)=>
                    {
                        if(this.state.userData.isLogin){
                            if(this.state.isCreator != 'true'){
                                return ( <Redirect to='/feed' /> )
                            } else if(this.state.isCreator == 'true' && this.state.isProfileCompleted == 'true'){
                                return ( <Marketting propValue={this.props} userLogout={this.logout}/> )
                            } else{
                                return (<Redirect to='/creator/personal-information' />)
                            }
                        } else{
                            return (<Redirect to='/sign-in' />) 
                        }
                    }
                } />
                <Route path="/page-management" component={(props)=>
                    {
                        if(this.state.userData.isLogin){
                            if(this.state.isCreator != 'true'){
                                return ( <Redirect to='/feed' /> )
                            } else if(this.state.isCreator == 'true' && this.state.isProfileCompleted == 'true'){
                                return ( <PageManagement propValue={this.props} userLogout={this.logout}/> )
                            } else{
                                return (<Redirect to='/creator/personal-information' />)
                            }
                        } else{
                            return (<Redirect to='/sign-in' />) 
                        }
                    }
                } />
                <Route path="/add-post" component={(props)=>
                    {
                        if(this.state.userData.isLogin){
                            if(this.state.isCreator != 'true'){
                                return ( <Redirect to='/feed' /> )
                            } else if(this.state.isCreator == 'true' && this.state.isProfileCompleted == 'true'){
                                return ( <AddPost propValue={this.props} userLogout={this.logout}/> )
                            } else{
                                return (<Redirect to='/creator/personal-information' />)
                            }
                        } else{
                            return (<Redirect to='/sign-in' />) 
                        }
                    }
                } />
                <Route path="/live-stream" component={(props)=>
                    {
                        if(this.state.userData.isLogin){
                            if(this.state.isCreator != 'true'){
                                return ( <Redirect to='/feed' /> )
                            } else if(this.state.isCreator == 'true' && this.state.isProfileCompleted == 'true'){
                                return ( <LiveStream propValue={this.props} userLogout={this.logout}/> )
                            } else{
                                return (<Redirect to='/creator/personal-information' />)
                            }
                        } else{
                            return (<Redirect to='/sign-in' />) 
                        }
                    }
                } />

               
                <Route path="/:creatorId/sign-up" component={(props)=>
                    <PublicCreatorSignup updateStateSignup={this.updateAuthState} propValue={props}/>} />
                <Route path="/:creatorId/sign-in" component={(props)=>
                    <PublicCreatorSignin updateStateSignin={this.updateAuthState} propValue={props}/>} />
                <Route path="/user-verification" component={(props)=>
                    <UserVerification updateStateSignup={this.updateAuthState} propValue={this.props} />
                } />

                <Route path="/recover/:step" component={ForgotPasswordVerification} />
                <Route path="/forgot-password/:step" component={ForgotPassword} />
                <Route path="/reset/:password" component={ResetPassword} />
               
                <Route path="/:creatorId/:username/post/:postId" component={(props)=> this.state.userData.isLogin ?
                    ( <CreatorSinglePost propValue={props} userLogout={this.logout}/> )
                   : (<Redirect to='/sign-in' />) } />

                <Route path="/:username/post/:postId" component={(props)=> this.state.userData.isLogin ?
                    ( <FeedSinglePost propValue={props} userLogout={this.logout}/> )
                   : (<Redirect to='/sign-in' />) } />

                <Route path="/search/:searchType/:searchString" component={ManageSearch} />
                <Route path="/search" component={ManageSearch} />
                
                <Route path="/creator-page/:creatorID/subscribe" component={(props)=> this.state.userData.isLogin ?
                    ( <BecomeSubscriber propValue={props} userLogout={this.logout}/> )
                   : (<Redirect to='/sign-in' />) } />
                <Route path="/creator-page/:creatorID" component={(props)=> (this.state.userData.isLogin )?
                    ( <CreatorProfileScreen propValue={props} userLogout={this.logout}/> )
                   : (<Redirect to='/sign-in' />) } />
                <Route path="/:otherUserID" component={(props)=>(this.state.userData.isLogin )? 
                    (<OtherUserProfile otherUserProfileProp={props} userLogout={this.logout} />)
                    : (<Redirect to='/sign-in' />) } />
              
                </AnimatedSwitch>
                </Switch>
            </BlockUi>
            </div>
        )
    }
}

export default withRouter(Layout);
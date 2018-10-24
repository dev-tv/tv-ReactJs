/* import react modules */
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect, withRouter } from 'react-router-dom';
import { Render } from 'react-dom';
import Alert from 'react-s-alert';
import BlockUi from 'react-block-ui';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Row, Col } from 'reactstrap';
import Formsy from 'formsy-react';

/* Using default styles: */
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css';

/* import helper file */
import Constants from '../../config/constants';
import {setCookie, getCookie, deleteCookie,updateUserValues,thumbnailUrlGenerator} from '../../config/helper';
import Message from '../../config/messages';
import MyInput from '../../config/formValidation';

/* import other components */
import Footer from '../blocks/footer';
import YourInformation from './yourInfo';
import CreatingContent from './content';
import ProfileInformation from './profile';
import Rewards from './rewards';
import Goals from './goals';
import ThankYouMessage from './thanks';
import Payment from './payment';
import Launch from './launch';

class CreatorSignupForm extends React.Component {
  constructor(props) {
    super(props);
    let token = localStorage.getItem('token');
    let email = localStorage.getItem('email');
    let username = localStorage.getItem("fullname");
    let isProfileCompleted = localStorage.getItem("isProfileCompleted");
    let isLogin = (token && username && email) ? true : false;

    this.state = {
      errors: {},
      profileFileType: "",
      coverFileType: "",
      profileExtensionType: "",
      coverExtensionType: "",
      profilePlayerId: "",
      coverPlayerId: "",
      profileSignedUrl: "",
      profileTargetFile: "",
      coverSignedUrl: "",
      coverTargetFile: "",
      creatorData: {stage:1, username:username, currency: "", alterEGO:"", aboutYou:"", category:[], categories:[], creatorPunchLine:"", contentType:"", customUrl:"", facebookLink:"", youtubeLink:"", instagramLink:"", twitterLInk:"", coverPic:"", coverPicThumbSmall: "", coverPicThumbMedium: "", profilePic:"", profilePicThumbSmall: "", profilePicThumbMedium: "", coverPicThumb: "", isProfilePicChanged: false, isCoverPicChanged: false, rewards:[], thanksMessage:"", payment: {paymentSchedule:"", baseLocation:"", accountType:"", paymentType:""}, paymentMethods:[], goals:[], goalData: {goalName: "", amount: "", description: "", contentType: "" }},
      token: token,
      blocking: false,
      contentType: "EARNING",
      tempRewards: {title:"", price:"", description:"", subscription:false, subscriptionLimit:0, shipping:false, rewardPic:"", rewardPicThumb:""},
      isLogin: isLogin,
      isProfileCompleted: isProfileCompleted
    }

    /**** binding to make context of this to class ***/
    this.previousStage = this.previousStage.bind(this);
    this.nextStage = this.nextStage.bind(this);
    this.getCreatorSignupData = this.getCreatorSignupData.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.getPaymentType = this.getPaymentType.bind(this);
    this.appendGoals = this.appendGoals.bind(this);
    this.setStage = this.setStage.bind(this);

    /** binding of child form data handling **/
    this.handleYourInformationFormData = this.handleYourInformationFormData.bind(this);
    this.handleContentFormData = this.handleContentFormData.bind(this);
    this.handleProfileFormData = this.handleProfileFormData.bind(this);
    this.handleRewardFormData = this.handleRewardFormData.bind(this);
    this.handleGoalFormData = this.handleGoalFormData.bind(this);
    this.handleThanksFormData = this.handleThanksFormData.bind(this);
    this.handlePaymentFormData = this.handlePaymentFormData.bind(this);
    this.setProfileCoverInitialUpdation = this.setProfileCoverInitialUpdation.bind(this);
  }

  componentDidMount() {
    this.getCreatorSignupData();
    this.getCategories();
    this.getPaymentType();
  }

  /**** function for next stage ****/
  nextStage(nextStageURL) {
    this.props.history.push(nextStageURL);
  }

  /**** function for previous stage ****/
  previousStage() {
    this.setState({creatorData: Object.assign({}, this.state.creatorData, {stage: this.state.creatorData.stage - 1}) });
  }

  /**** function to get data of creator ****/
  getCreatorSignupData(){
    let _that = this;
    _that.setState({ blocking: true});
    if(_that.state.isLogin == true){

      /***** fetch API for categories starts **********/
      fetch(Constants.SERVER_URL + '/api/v1/become-creator/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.state.token
        },
      }).then  (function (response) {
        let responseData = response.json();
        responseData.then(function (data) { 
          if (data.status == 200) {
            _that.setState({blocking: false, creatorData: data.data});
            if(_that.state.creatorData.stage == 2){
              _that.props.history.push(`${_that.props.match.url}/content`);
            } else if(_that.state.creatorData.stage == 3) {
              _that.props.history.push(`${_that.props.match.url}/profile-information`);
            } else if(_that.state.creatorData.stage == 4) {
              _that.props.history.push(`${_that.props.match.url}/rewards`);
            } else if(_that.state.creatorData.stage == 5) {
              _that.props.history.push(`${_that.props.match.url}/goals`);
            } else if(_that.state.creatorData.stage == 6) {
              _that.props.history.push(`${_that.props.match.url}/thanks`);
            } else if(_that.state.creatorData.stage == 7) {
              _that.props.history.push(`${_that.props.match.url}/payment`);
            } else if(_that.state.creatorData.stage == 8 && _that.state.isProfileCompleted == "false") {
              _that.props.history.push(`${_that.props.match.url}/launch`);
            } else {
              _that.props.history.push(`${_that.props.match.url}/personal-information`);
            }

            let profileFile = '';
            let coverFile = '';
            let profileExtension = '';
            let coverExtension = '';
            let profilePicThumbMedium = '';
            let coverPicThumbMedium = '';

            if(data.data.profilePicType != null && data.data.profilePicType != ""){
              let profileFileType = data.data.profilePicType.split("/");
              profileFile = profileFileType[0];
            }
            if(data.data.coverPicType != null && data.data.coverPicType != ""){
              let coverFileType = data.data.coverPicType.split("/");
              coverFile = coverFileType[0];
            }
            if(data.data.profilePic != undefined && data.data.profilePic != null && data.data.profilePic != ""){
              let profileExtensionType = data.data.profilePic.split(".");
              profileExtension = profileExtensionType[profileExtensionType.length -1];
              let thumbnailParametersProfile = {
                originalUrl: data.data.profilePic,
                dimensions: "200x200",
                fileType: "profile"
              }
              profilePicThumbMedium = thumbnailUrlGenerator(thumbnailParametersProfile);
            }

            if(data.data.coverPic != undefined && data.data.coverPic != null && data.data.coverPic != ""){
              let coverExtensionType = data.data.coverPic.split(".");
              coverExtension = coverExtensionType[coverExtensionType.length -1];
              let thumbnailParametersCover = {
                originalUrl: data.data.coverPic,
                dimensions: "1200x330",
                fileType: "cover"
              }
              coverPicThumbMedium = thumbnailUrlGenerator(thumbnailParametersCover);
            }
           
            _that.setState({profileExtensionType: profileExtension, profilePlayerId: "profile_"+data.data.id, coverExtensionType: coverExtension, coverPlayerId: "cover_"+data.data.id,profileFileType: profileFile, coverFileType: coverFile, creatorData: Object.assign({}, _that.state.creatorData, {profilePicThumbMedium: profilePicThumbMedium}), creatorData: Object.assign({}, _that.state.creatorData, {coverPicThumbMedium: coverPicThumbMedium})}, function(){
              
            });
           
          } else if (data.status == 204) {
            _that.setState({ blocking: false});
          } else if (data.status == 404) {
            _that.setState({ blocking: false});
          }  else if (data.status == 401) {
            _that.setState({ blocking: false});
            
          } else {
            _that.setState({ blocking: false });
            Alert.error('<h4>' + Message.ERROR + '</h4>', {
              position: 'top',
              effect: 'stackslide',
              beep: false,
              timeout: 3000
            });
          }
        })
      }).catch(function (error) {
        _that.setState({ blocking: false });
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

      /***** fetch API for data ends **********/
    }
  }

  /**** function to get payment Type ****/
  getPaymentType(){
    let _that = this;
    _that.setState({ blocking: true});
    if(_that.state.isLogin == true){
      /***** fetch API for payment type **********/
      fetch(Constants.SERVER_URL + '/api/v1/payment-category/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.state.token
        },
      }).then(function (response) {
          let responseData = response.json();
          responseData.then(function (data) { 
            if (data.status == 200 || data.status == 201) {
              _that.setState({ blocking: false});
              _that.setState({creatorData: Object.assign({}, _that.state.creatorData, {paymentMethods: data.data}) });
             }  else if (data.status == 401) {
              _that.setState({ blocking: false});
            } else {
              _that.setState({ blocking: false });
              Alert.error('<h4>' + Message.ERROR + '</h4>', {
                position: 'top',
                effect: 'stackslide',
                beep: false,
                timeout: 3000
              });
            }
        })
      }).catch(function (error) {
        _that.setState({ blocking: false });
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

      /***** fetch API for payment type **********/
    }
  }

  /**** function to get categories of events ****/
  getCategories(){
    let _that = this;
    _that.setState({ blocking: true});
    if(_that.state.isLogin == true){
       /***** fetch API for categories starts **********/
      fetch(Constants.SERVER_URL + '/api/v1/category/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }).then(function (response) {
          let responseData = response.json();
          responseData.then(function (data) { 
            if (data.status == 200) {
              _that.setState({ blocking: false});
              _that.setState({creatorData: Object.assign({}, _that.state.creatorData, {categories: data.data}) });
            }  else if (data.status == 401) {
              _that.setState({ blocking: false});
             
            } else {
              _that.setState({ blocking: false });
              Alert.error('<h4>' + Message.ERROR + '</h4>', {
                position: 'top',
                effect: 'stackslide',
                beep: false,
                timeout: 3000
              });
            }
        })
      }).catch(function (error) {
        _that.setState({ blocking: false });
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

      /***** fetch API for categories ends **********/    
    }    
  }

  /**** function to append goals ****/
  appendGoals(contentType){
    if(this.state.creatorData.goals == null) {
      this.state.creatorData.goals = [];
    }

    let goalsData = this.state.creatorData.goals.concat({goalName: "", amount: "", description: "", contentType: contentType });
    this.setState({ creatorData: Object.assign({}, this.state.creatorData, { goals: goalsData }) });
  }

  /**** function to handle goals from data ****/
  handleYourInformationFormData(data){
    this.setState({ creatorData: Object.assign({}, this.state.creatorData, { username: data.username }) });
    this.setState({ creatorData: Object.assign({}, this.state.creatorData, { alterEGO: data.alterEGO }) });
    this.setState({ creatorData: Object.assign({}, this.state.creatorData, { aboutYou: data.aboutYou }) });
  }

  /**** function to handle content from data ****/
  handleContentFormData(data,ctype){
    if(ctype == "category"){
      this.setState({ creatorData: Object.assign({}, this.state.creatorData, { category: data }) });
    } else if(ctype == "contentType"){
      this.setState({ creatorData: Object.assign({}, this.state.creatorData, { contentType: data }) });
    }
  }

  /**** function to handle profile from data ****/
  handleProfileFormData(data,ctype){
    if(ctype == "category"){
      this.setState({ creatorData: Object.assign({}, this.state.creatorData, { category: data }) });
    } else if(ctype == "contentType"){
      this.setState({ contentType: ctype });
    } else if(ctype == "profilePic"){
      this.setState({ creatorData: Object.assign({}, this.state.creatorData, { profilePicThumbMedium: data }) });
    } else if(ctype == "coverPic"){
      this.setState({ creatorData: Object.assign({}, this.state.creatorData, { coverPicThumbMedium: data }) });
    } else if(ctype == "profileSignedUrl"){
      this.setState({ profileSignedUrl: data.signedUrl , profileTargetFile: data.targetFile  });
    } else if(ctype == "coverSignedUrl"){
      this.setState({ coverSignedUrl: data.signedUrl , coverTargetFile: data.targetFile  });
    }
  }

  /**** function to handle reward from data ****/
  handleRewardFormData(data){
    this.setState({ creatorData: Object.assign({}, this.state.creatorData, { rewards: data }) });
  }

  /**** function to handle goals from data ****/
  handleGoalFormData(data, contentType){
    this.setState({ creatorData: Object.assign({}, this.state.creatorData, { goals: data }) });
    this.setState({ creatorData: Object.assign({}, this.state.creatorData, { goals: data }) });
  }

  /**** function to handle thanks from data ****/
  handleThanksFormData(data){
    console.log("data reward", data);
  }

  /**** function to handle payment from data ****/
  handlePaymentFormData(data, type){
    if(type == "paymentSchedule"){
      this.setState({ creatorData: Object.assign({}, this.state.creatorData, { payment: Object.assign({}, this.state.creatorData.payment, { paymentSchedule: data }) }) });
    }
    if(type == "baseLocation"){
      this.setState({ creatorData: Object.assign({}, this.state.creatorData, { payment: Object.assign({}, this.state.creatorData.payment, { baseLocation: data }) }) });
    }
    if(type == "accountType"){
      this.setState({ creatorData: Object.assign({}, this.state.creatorData, { payment: Object.assign({}, this.state.creatorData.payment, { accountType: data }) }) });
    }
  }

  setProfileCoverInitialUpdation(data){
    this.setState({ 
      profileSignedUrl: "",
      profileTargetFile: "",
      coverSignedUrl: "",
      coverTargetFile: "",
      creatorData: Object.assign({}, this.state.creatorData, { isProfilePicChanged: data.isProfileUpdated }), 
      creatorData: Object.assign({}, this.state.creatorData, { isCoverPicChanged: data.isCoverUpdated }), 
    });
  }

  /**** function to set stage ****/
  setStage(stage){
    this.setState({ creatorData: Object.assign({}, this.state.creatorData, { stage: stage }) });
  }

  /**** render view  ****/
  render(){
    console.log("render profilePicThumbMedium ====", this.state.creatorData.profilePicThumbMedium, this.state.creatorData.coverPicThumbMedium);
    let launchTab = '';
    let launchArrow = '';
    if(this.state.isProfileCompleted == "true"){
      launchTab = '';
      launchArrow = '';
    } else {
      launchTab = <li className={ (this.state.creatorData.stage >= 8) ? 'step active': 'step' }><Link to={`${this.props.match.url}/launch`} onClick={this.setStage.bind(this,8)}>Launch! </Link></li>;
      launchArrow = <i className="fa fa-long-arrow-right"></i>;
    }

    return(
      <div>
        <Route exact path={this.props.match.url} component={()=>(
          <Redirect to='/creator/personal-information'/>
        ) }  />

        <main className="signupbreadcum">
          <div className="container"> 
            <div className="row">
              <div className="col-md-12 topbreadcrumb">
                  <ul>
                    <li className={ (this.state.creatorData.stage >= 1) ? 'step active': 'step' }><Link to={`${this.props.match.url}/personal-information`} onClick={this.setStage.bind(this,1)}>You <i className="fa fa-long-arrow-right"></i></Link></li>
                    <li className={ (this.state.creatorData.stage >= 2) ? 'step active': 'step' }><Link to={`${this.props.match.url}/content`} onClick={this.setStage.bind(this,2)}>Content <i className="fa fa-long-arrow-right"></i></Link></li>
                    <li className={ (this.state.creatorData.stage >= 3) ? 'step active': 'step' }><Link to={`${this.props.match.url}/profile-information`} onClick={this.setStage.bind(this,3)}>Profile <i className="fa fa-long-arrow-right"></i></Link></li>
                    <li className={ (this.state.creatorData.stage >= 4) ? 'step active': 'step' }><Link to={`${this.props.match.url}/rewards`} onClick={this.setStage.bind(this,4)}>Rewards <i className="fa fa-long-arrow-right"></i></Link></li>
                    <li className={ (this.state.creatorData.stage >= 5) ? 'step active': 'step' }><Link to={`${this.props.match.url}/goals`} onClick={this.setStage.bind(this,5)}>Goals <i className="fa fa-long-arrow-right"></i></Link></li>
                    <li className={ (this.state.creatorData.stage >= 6) ? 'step active': 'step' }><Link to={`${this.props.match.url}/thanks`} onClick={this.setStage.bind(this,6)}>Thanks <i className="fa fa-long-arrow-right"></i></Link></li>
                    <li className={ (this.state.creatorData.stage >= 7) ? 'step active': 'step' }><Link to={`${this.props.match.url}/payment`} onClick={this.setStage.bind(this,7)}>Payment {launchArrow} </Link></li>
                    {launchTab}
                  </ul>
                <div className="col-md-12">
                  <div className="yourbox yourboxhtml">
                    <Route path={`${this.props.match.url}/personal-information`} component={(props)=>this.state.isLogin ? (
                      <YourInformation stateValues={this.state} nextStage={this.nextStage} setCurrentStage={this.setStage} handleYourInfoData={this.handleYourInformationFormData} propsValue={this.props}/>
                    ) : (<Redirect to='/sign-in' />) } />

                    <Route path={`${this.props.match.url}/content`} component={(props)=>this.state.isLogin ? (
                          <CreatingContent stateValues={this.state} nextStage={this.nextStage} setCurrentStage={this.setStage} handleContentData={this.handleContentFormData} disableButtonProp={this.disableButton} enableButtonProp={this.enableButton} propsValue={this.props}/>
                          ) : (<Redirect to='/sign-in' />) } />

                    <Route path={`${this.props.match.url}/profile-information`} component={(props)=>this.state.isLogin ? (
                          <ProfileInformation stateValues={this.state} nextStage={this.nextStage} setCurrentStage={this.setStage} handleProfileData={this.handleProfileFormData} setProfileCoverInitialUpdation={this.setProfileCoverInitialUpdation} disableButtonProp={this.disableButton} enableButtonProp={this.enableButton} propsValue={this.props}/>
                          ) : (<Redirect to='/sign-in' />) } />

                    <Route path={`${this.props.match.url}/rewards`} component={(props)=>this.state.isLogin ? (
                          <Rewards stateValues={this.state} nextStage={this.nextStage} setCurrentStage={this.setStage} handleRewardData={this.handleRewardFormData} disableButtonProp={this.disableButton} enableButtonProp={this.enableButton} propsValue={this.props}/>
                          ) : (<Redirect to='/sign-in' />) } />

                    <Route path={`${this.props.match.url}/goals`} component={(props)=>this.state.isLogin ? (
                          <Goals stateValues={this.state} nextStage={this.nextStage} setCurrentStage={this.setStage}  handleGoalData={this.handleGoalFormData} disableButtonProp={this.disableButton} enableButtonProp={this.enableButton} propsValue={this.props} addGoals={this.appendGoals}/>
                         ) : (<Redirect to='/sign-in' />) } />

                    <Route path={`${this.props.match.url}/thanks`} component={(props)=>this.state.isLogin ? (
                          <ThankYouMessage stateValues={this.state} nextStage={this.nextStage} setCurrentStage={this.setStage} handleThanksData={this.handleThanksFormData} disableButtonProp={this.disableButton} enableButtonProp={this.enableButton} propsValue={this.props}/>
                          ) : (<Redirect to='/sign-in' />) } />

                    <Route path={`${this.props.match.url}/payment`} component={(props)=>this.state.isLogin ? (
                          <Payment stateValues={this.state} nextStage={this.nextStage} setCurrentStage={this.setStage} handlePaymentData={this.handlePaymentFormData} disableButtonProp={this.disableButton} enableButtonProp={this.enableButton} propsValue={this.props}/>
                          ) : (<Redirect to='/sign-in' />) } />

                    <Route path={`${this.props.match.url}/launch`} component={(props)=>this.state.isLogin ? (
                          <Launch stateValues={this.state} nextStage={this.nextStage} setCurrentStage={this.setStage} disableButtonProp={this.disableButton} enableButtonProp={this.enableButton} propsValue={this.props}/>
                         ) : (<Redirect to='/sign-in' />) } />

                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer/>
      </div>
    )
  }
} 

export default CreatorSignupForm;
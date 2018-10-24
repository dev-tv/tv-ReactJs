/* import react modules  */
import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import Alert from 'react-s-alert';
import BlockUi from 'react-block-ui';
import Formsy from 'formsy-react';
import axios from 'axios';
import ReactFlowPlayer from "react-flow-player";
import ReactCrop, { makeAspectCrop } from 'react-image-crop';
import { confirmAlert } from 'react-confirm-alert';

import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css';
import 'react-image-crop/dist/ReactCrop.css';

/* import other components */
import Footer from './blocks/footer.js';
import ProfilePicComponent from './profilePic.js';
import CoverPicComponent from './coverPic.js';

/* import helper file */
import Constants from '../config/constants';
import {updateUserValues,thumbnailUrlGenerator} from '../config/helper';
import Message from '../config/messages';
import MyInput from '../config/formValidation';

class UserProfile extends React.Component {
	constructor(props) {
	    super(props);
	    let token = localStorage.getItem('token');
	    let email = localStorage.getItem('email');
	    let username = localStorage.getItem("fullname");
	    let isLogin = (token && username && email) ? true : false;

	    this.state = {
	    	token: token,
	    	profileModal: false,
	    	coverModal: false,
	    	blocking: false,
	      	canSubmit: false,
	      	isLogin: isLogin,
	      	email:email,
	      	imagePreviewProfilePicUrl: '',
      		imagePreviewCoverPicUrl: '',
      		isProfilePicChanged: false,
      		isCoverPicChanged: false,
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
      		userData: {username:username, alterEGO:"", aboutYou:"", category:[], categories:[], facebookLink:"", youtubeLink:"", instagramLink:"", twitterLInk:"", coverPic:"", profilePic:"", profilePicThumb: "", profilePicThumbSmall: "", profilePicThumbMedium: "", coverPicThumb: "", coverPicThumbSmall: "", coverPicThumbMedium: "" }
	    }

	    /**** binding to make context of this to class ***/
	    this.formValueChange = this.formValueChange.bind(this);
	    this.getCategories = this.getCategories.bind(this);
	    this.getUserData = this.getUserData.bind(this);
	    this.submitInformation = this.submitInformation.bind(this);
	    this.disableButton = this.disableButton.bind(this);
	    this.enableButton = this.enableButton.bind(this);
    	this.profileToggle = this.profileToggle.bind(this);
    	this.coverToggle = this.coverToggle.bind(this);
    	this.handleProfileImage = this.handleProfileImage.bind(this);
    	this.handleCoverImage = this.handleCoverImage.bind(this);
    	this.handleSignedUrlProfileData = this.handleSignedUrlProfileData.bind(this);
    	this.handleSignedUrlCoverData = this.handleSignedUrlCoverData.bind(this);
	    this.uploadProfilePicS3 = this.uploadProfilePicS3.bind(this);
    	this.uploadCoverPicS3 = this.uploadCoverPicS3.bind(this);
  	}

  	componentWillMount() {
      	this.getUserData();
	    let _that = this;

	    setTimeout(function () {
	      _that.getCategories();         
	    }, 0);
  	}

  	componentDidMount() {
      	// this.getUserData();
	    this.getCategories();
  	}

  	/**** function to Toggle a modal for profile pic ****/
  	profileToggle() {
    	this.setState({ profileModal: !this.state.profileModal });
  	}

	/**** function to Toggle a modal for cover pic ****/
  	coverToggle() {
    	this.setState({ coverModal: !this.state.coverModal });
  	}	

  	/**** function to disable Button ****/
  	disableButton() {
    	this.setState({ canSubmit: false });
  	}

  	/**** function to enable Button ****/
  	enableButton() {
    	this.setState({ canSubmit: true });
  	} 

  	/**** function to handle change in form inputs ****/
  	formValueChange(event) {
		if (event.target.id == 'username') {
		  this.state.userData.username = event.target.value;
		} else if (event.target.id == 'alterEGO') {
		  this.state.userData.alterEGO = event.target.value;
		} else if (event.target.id == 'aboutYou') {
		  this.state.userData.aboutYou = event.target.value;
		} else if (event.target.name == 'category[]') {
			if(this.state.userData.category == null){
        		this.state.userData.category = [];
      		}
	      	if(this.state.userData.category.indexOf(event.target.value) == -1){
	        	this.state.userData.category.push(event.target.value);
	      	} else {
	        	this.state.userData.category.splice(this.state.userData.category.indexOf(event.target.value),1);
	      	}
		} else if (event.target.id == 'facebookLink') {
      		this.state.userData.facebookLink = event.target.value;
    	} else if (event.target.id == 'youtubeLink') {
      		this.state.userData.youtubeLink = event.target.value;
    	} else if (event.target.id == 'instagramLink') {
      		this.state.userData.instagramLink = event.target.value;
    	} else if (event.target.id == 'twitterLInk') {
      		this.state.userData.twitterLInk = event.target.value;
    	}

		return true;
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
		          // 'Authorization': this.state.token
		        },
	      	}).then(function (response) {
	          	let responseData = response.json();
	          	responseData.then(function (data) { 
		            if (data.status == 200) {
		              	_that.setState({blocking: false, userData: Object.assign({}, _that.state.userData, {categories: data.data}) });
		            } else if (data.status == 401) {
			            _that.setState({ blocking: false});
			            _that.props.userLogout();
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

  	/**** function to get data of user ****/
  	getUserData(){
	    let _that = this;
	    _that.setState({ blocking: true});
	    if(_that.state.isLogin == true){
		    /***** fetch API for data starts **********/
		    fetch(Constants.SERVER_URL + '/api/v1/become-creator/', {
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
		        		let thumbnailParameters = {
							originalUrl: data.data.profilePic,
							dimensions: "60x60",
							fileType: "profile"
	            		}

			        	updateUserValues(data.data.fullname,data.data.isCreator,data.data.isProfileCompleted,thumbnailUrlGenerator(thumbnailParameters));
		          		
		          		let profileFile = '';
		          		let coverFile = '';
		          		let profileExtension = '';
		          		let coverExtension = '';

		          		if(data.data.profilePicType != null && data.data.profilePicType != ""){
				        	let profileFileType = data.data.profilePicType.split("/");
				        	profileFile = profileFileType[0].toUpperCase();
		          		}
		          		if(data.data.coverPicType != null && data.data.coverPicType != ""){
				        	let coverFileType = data.data.coverPicType.split("/");
				        	coverFile = coverFileType[0].toUpperCase();
		          		}
		          		if(data.data.profilePic != null && data.data.profilePic != ""){
				        	let profileExtensionType = data.data.profilePic.split(".");
				        	profileExtension = profileExtensionType[profileExtensionType.length -1];
		          		}
		          		if(data.data.coverPic != null && data.data.coverPic != ""){
				        	let coverExtensionType = data.data.coverPic.split(".");
				        	coverExtension = coverExtensionType[coverExtensionType.length -1];
		          		}

		          		let thumbnailParametersProfile = {
							originalUrl: data.data.profilePic,
							dimensions: "200x200",
							fileType: "profile"
	            		}

	            		let thumbnailParametersCover = {
							originalUrl: data.data.coverPic,
							dimensions: "1200x330",
							fileType: "cover"
	            		}
				         
		          		_that.setState({
		          			blocking: false, userData: data.data, profileExtensionType: profileExtension, profilePlayerId: "profile_"+data.data.id, coverExtensionType: coverExtension, coverPlayerId: "cover_"+data.data.id, profileFileType: profileFile, coverFileType: coverFile, imagePreviewProfilePicUrl: thumbnailUrlGenerator(thumbnailParametersProfile), imagePreviewCoverPicUrl: thumbnailUrlGenerator(thumbnailParametersCover)
		          		});
		          	} else if (data.status == 204) {
		          		_that.setState({ blocking: false});
		        	} else if (data.status == 401) {
			            _that.setState({ blocking: false});
			            _that.props.userLogout();
		          	} else if (data.status == 404) {
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

  	/* method that handle cropped profile image */
  	handleProfileImage(data){
  		this.setState({imagePreviewProfilePicUrl: data.imageUrl, profilePlayerId: "profile_"+data.profilePlayerId, profileFileType: data.profileType, profileExtensionType: data.profileExtension });
  	}  	

  	/* method that handle cropped profile image */
  	handleCoverImage(data){
  		this.setState({imagePreviewCoverPicUrl: data.imageUrl, coverPlayerId: "cover_"+data.coverPlayerId, coverFileType: data.coverType, coverExtensionType: data.coverExtension });
  	}

	/* method that handle signed url response */
	handleSignedUrlProfileData(data){
		this.setState({profileSignedUrl: data.signedUrl, profileTargetFile: data.targetFile})
	}

	/* method that handle signed url response */
	handleSignedUrlCoverData(data){
		this.setState({coverSignedUrl: data.signedUrl, coverTargetFile: data.targetFile})
	}

	/* method that upload profile pic on S3 */
	uploadProfilePicS3(){
  		var _that = this;
		var options = {
            headers: {
                'Content-Type': this.state.profileTargetFile.type
            }
      	}
      	
      	/***** fetch API for upload profile pic starts **********/    
	    return new Promise(function(resolve,reject){
		   	axios.put(_that.state.profileSignedUrl, _that.state.profileTargetFile, options).then(function (result) { 
		   	   let mediaUrl = result.config.url.split("?")[0];
		   	   let mediaProfileUrl = mediaUrl.substring(mediaUrl.lastIndexOf("/") + 1, mediaUrl.length);
		        
	        	if(result.status == 200 ){
	        		_that.setState({userData: Object.assign({}, _that.state.userData, {profilePic: mediaProfileUrl}), isProfilePicChanged: true});
	        		resolve(result.config);
	        	} else {
	          		Alert.error('<h4>' + Message.ERROR + '</h4>', {
			            position: 'top',
			            effect: 'stackslide',
			            beep: false,
			            timeout: 3000
	          		});
	          		reject();
	        	}
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
	        	reject();
	    	}); 
		})
        /***** fetch API for upload profile pic ends **********/  
	}

	/* method that upload cover pic on S3 */
	uploadCoverPicS3(){
		var _that = this;
		var options = {
            headers: {
                'Content-Type': this.state.coverTargetFile.type
            }
      	}

      	/***** fetch API for upload cover pic starts **********/    
	    return new Promise(function(resolve,reject){
		   	axios.put(_that.state.coverSignedUrl, _that.state.coverTargetFile, options).then(function (result) { 
		   		let mediaUrl = result.config.url.split("?")[0];
		   		let mediaCoverUrl = mediaUrl.substring(mediaUrl.lastIndexOf("/") + 1, mediaUrl.length);
		       

	        	if(result.status == 200 ){
	        		_that.setState({userData: Object.assign({}, _that.state.userData, {coverPic: mediaCoverUrl}), isCoverPicChanged: true});
	        		resolve(result.config);
	        	} else{
	          		Alert.error('<h4>' + Message.ERROR + '</h4>', {
			            position: 'top',
			            effect: 'stackslide',
			            beep: false,
			            timeout: 3000
	          		});
	          		reject();
	        	}
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
	        	reject();
	    	}); 
		})
        /***** fetch API for upload cover pic ends **********/  
	}

  	/**** function to handle submit event ****/
  	submitInformation() {
	    let _that = this;
	    _that.setState({ blocking: true});
	    var promiseArray = [];

	    if(_that.state.profileSignedUrl != undefined && _that.state.profileSignedUrl != ""){
	    	let profilePromise = _that.uploadProfilePicS3();
	    	promiseArray.push(profilePromise);
	    }

	    if(_that.state.coverSignedUrl != undefined && _that.state.coverSignedUrl != ""){
	    	let coverPromise = _that.uploadCoverPicS3();
	    	promiseArray.push(coverPromise);
	    }

	    if(promiseArray != undefined && promiseArray.length != 0 && promiseArray != null){
	  		Promise.all(promiseArray).then(function(values) {

			  	/***** fetch API for your information starts **********/
			    fetch(Constants.SERVER_URL + '/api/v1/user/', {
			      	method: 'PUT',
			      	headers: {
				        'Accept': 'application/json',
				        'Content-Type': 'application/json',
				        'Authorization': _that.state.token
			      	},
			      	body: JSON.stringify({
				        username: _that.state.userData.username,
				        alterEGO: _that.state.userData.alterEGO,
				        aboutYou: _that.state.userData.aboutYou,
				        email: _that.state.email,
				        category: _that.state.userData.category,
				        facebookLink: _that.state.userData.facebookLink,
				        youtubeLink: _that.state.userData.youtubeLink,
				        instagramLink: _that.state.userData.instagramLink,
				        twitterLInk: _that.state.userData.twitterLInk,
				        coverPic: _that.state.userData.coverPic,
		        		profilePic: _that.state.userData.profilePic,
		        		isProfilePicChanged: _that.state.isProfilePicChanged,
						isCoverPicChanged: _that.state.isCoverPicChanged
			      	}),
			    }).then(function (response) {
			      	let responseData = response.json();
			      	responseData.then(function (data) { 
			        if (data.status == 200) {
			        	_that.setState({ blocking: false });
			        	let profilePic="";
			        	let thumbnailParameters = {
							originalUrl: data.data.profilePic,
							dimensions: "60x60",
							fileType: "profile"
	            		}

			        	updateUserValues(data.data.fullname,data.data.isCreator,data.data.isProfileCompleted,thumbnailUrlGenerator(thumbnailParameters));
			          	Alert.success('<h4>' + "Profile updated successfully." + '</h4>', {
				            position: 'top',
				            effect: 'stackslide',
				            beep: false,
				            timeout: 3000
			          	});
			          	_that.props.propValue.history.push("/feed");
			        } else if (data.status == 401) {
			            _that.setState({ blocking: false});
			            _that.props.userLogout();
		          	} else if(data.status == 404){
			           	_that.setState({ blocking: false });
			           	Alert.error('<h4>' + data.message + '</h4>', {
				              position: 'top',
				              effect: 'stackslide',
				              beep: false,
				              timeout: 3000
			           	});
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

			    /***** fetch API for your information ends **********/
			}).catch(function(error){
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
	    } else {

	    	/***** fetch API for your information starts **********/
		    fetch(Constants.SERVER_URL + '/api/v1/user/', {
		      	method: 'PUT',
		      	headers: {
			        'Accept': 'application/json',
			        'Content-Type': 'application/json',
			        'Authorization': _that.state.token
		      	},
		      	body: JSON.stringify({
			        username: _that.state.userData.username,
			        alterEGO: _that.state.userData.alterEGO,
			        aboutYou: _that.state.userData.aboutYou,
			        email: _that.state.email,
			        category: _that.state.userData.category,
			        facebookLink: _that.state.userData.facebookLink,
			        youtubeLink: _that.state.userData.youtubeLink,
			        instagramLink: _that.state.userData.instagramLink,
			        twitterLInk: _that.state.userData.twitterLInk,
			        coverPic: _that.state.userData.coverPic,
	        		profilePic: _that.state.userData.profilePic,
	        		isProfilePicChanged: _that.state.isProfilePicChanged,
					isCoverPicChanged: _that.state.isCoverPicChanged
		      	}),
		    }).then(function (response) {
		      	let responseData = response.json();
		      	responseData.then(function (data) { 
		        if (data.status == 200) {
		        	_that.setState({ blocking: false });
		        	let thumbnailParameters = {
						originalUrl: data.data.profilePic,
						dimensions: "60x60",
						fileType: "profile"
            		}

		        	updateUserValues(data.data.fullname,data.data.isCreator,data.data.isProfileCompleted,thumbnailUrlGenerator(thumbnailParameters));
		          	Alert.success('<h4>' + "Profile updated successfully." + '</h4>', {
			            position: 'top',
			            effect: 'stackslide',
			            beep: false,
			            timeout: 3000
		          	});
		          	_that.props.propValue.history.push("/feed");
		        } else if (data.status == 401) {
		            _that.setState({ blocking: false});
		            _that.props.userLogout();
	          	} else if(data.status == 404){
		           	_that.setState({ blocking: false });
		           	Alert.error('<h4>' + data.message + '</h4>', {
		              	position: 'top',
		              	effect: 'stackslide',
		              	beep: false,
		              	timeout: 3000
		           	});
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

		    /***** fetch API for your information ends **********/
	    }
  	}

	/**** render view  ****/
	render(){
		let category = [];
    	let imageProfilePreview = null;
	    let imageCoverPreview = null;
	 
		if(this.state.userData.categories != undefined && this.state.userData.categories != null){
        	category = this.state.userData.categories;
      	}

      	if(this.state.userData.category == null) {
        	this.state.userData.category=[];
      	}
	    		
      	const categoryList = category.map((categoryItems,index) => {
      		return (<div className="col-12 col-md-3" key={categoryItems.id}>
			        <div className="selectmultibtn">
			          <input type="checkbox" name="category[]" id={categoryItems.id} ref="category[]" value={categoryItems.id} onChange={this.formValueChange} defaultChecked={!(this.state.userData.category.indexOf(categoryItems.id) == -1)}/>
			          <label htmlFor={categoryItems.id}>{categoryItems.name}</label>
			        </div>
		      	</div>
      		)}
    	)

      	if(this.state.imagePreviewProfilePicUrl != undefined && this.state.imagePreviewProfilePicUrl != '') {
	    	// let profileFileType = this.state.profileFileType.toUpperCase();
	    	if(this.state.profileFileType == "IMAGE"){
	      		imageProfilePreview = (<img src={this.state.imagePreviewProfilePicUrl} />);
	    	} else if(this.state.profileFileType == "VIDEO"){
	    		let extension = "video/"+this.state.profileExtensionType;
				let videoURL = this.state.imagePreviewProfilePicUrl;
	    		imageProfilePreview = (<ReactFlowPlayer
						  	playerInitScript="http://releases.flowplayer.org/7.2.1/flowplayer.min.js"
						  	playerId={this.state.profilePlayerId}
						  	sources={[
							    {
							      	type: extension,
							      	src: videoURL
							    }
						  	]}
						/>)
	    	}
	    } else {
	      	imageProfilePreview = '';
	    }

	    if(this.state.imagePreviewCoverPicUrl != undefined && this.state.imagePreviewCoverPicUrl != '') {
	    	// let coverFileType = this.state.coverFileType.toUpperCase();
	    	if(this.state.coverFileType == "IMAGE"){
	      		imageCoverPreview = (<img src={this.state.imagePreviewCoverPicUrl} />);
	    	} else if(this.state.coverFileType == "VIDEO"){
	    		let extension = "video/"+this.state.coverExtensionType;
				let videoURL = this.state.imagePreviewCoverPicUrl;
				let coverPlayerId = this.state.coverPlayerId;
	    		imageCoverPreview = (<ReactFlowPlayer
						  	playerInitScript="http://releases.flowplayer.org/7.2.1/flowplayer.min.js"
						  	playerId={coverPlayerId}
						  	sources={[
							    {
							      	type: extension,
							      	src: videoURL
							    }
						  	]}
						/>)
	    	}
	    } else {
	      	imageCoverPreview = '';
	    }

		return(
			<div>
			<BlockUi blocking={this.state.blocking}>
				<Alert html={true} />
				<main className="signupbreadcum">      
			      <div className="container"> 
			        <div className="row">                    
			          <div className="col-md-12 userprofilemain">
			            <h2 className="heading">Your Profile Information</h2>
			            <div className="yourbox yourboxhtml"> 
			            <Formsy className="signup" onSubmit={this.submitInformation} onValid={this.enableButton} onInvalid={this.disableButton} id="userInfo" ref={(form) => this.userInfoFormRef = form} name="userInfo" >  
		                   <div className="profiletext">
		                     <div className="yourbox1 row yourbox3"> 
		                        <div className="col-md-12">
		                        <BlockUi blocking={this.state.blockingCover}>
		                          	<div className="uploadprofileimg change_coverpic">
		                          		{imageCoverPreview}
		                        		<a href="javascript:void(0)" onClick={this.coverToggle}><i className="fa fa-camera"></i> Change Cover</a>
                  					</div>
                  				</BlockUi>
                  				<BlockUi className="userprofileimgblocker"  blocking={this.state.blockingProfile}>
			                        <div className="uploadprofileimg uploadprofileimg2 userprofileimg change_profilepic">
			                            {imageProfilePreview}
		                        		<a href="javascript:void(0)" onClick={this.profileToggle} ><i className="fa fa-film" ></i> Change Profile</a>
			                        </div>
		                        </BlockUi>
								</div>
		                     </div>
		                     <div className="yourbox1 row">                       
		                        <div className="col-md-6">
		                            <label>Username</label>
                					<MyInput type="text" name="username" value={this.state.userData.username} placeholder="John Doe" id="username" ref="username" handleChange={this.formValueChange} required/>
		                        </div>                   
		                        <div className="col-md-6">
		                            <label>Alter ego <span className="text-right">(optional)</span></label>
                					<MyInput type="text" name="alterEGO" value={this.state.userData.alterEGO} id="alterEGO" ref="alterEGO" handleChange={this.formValueChange} />
            					</div>                     
		                        <div className="col-md-6">
		                            <label>Email</label>
		                            <input type="email" name="email" value={this.state.email} placeholder="johndoe@email.com" id="email" ref="email" readOnly/>
		                        </div> 
		                        <div className="col-md-12">                  
		                            <label>About You</label>
                					<textarea rows="6" name="aboutYou" key={this.state.userData.aboutYou ? 'notLoadedYet' : 'loaded'} defaultValue={this.state.userData.aboutYou} id="aboutYou" ref="aboutYou" onChange={this.formValueChange}></textarea> 
            					</div>
		                        <div className="col-md-12 intereted">
		                            <h1>What are you intereted in?</h1>
		                            <div className="row">
		                              {categoryList}
		                            </div>
		                        </div>
		                        <div className="col-md-12">
		                            <h3 className="formsubtitle">Links to your social accounts</h3>
		                            <div className="row">
				                      <div className="col-md-6">                                
				                          <label>Facebook</label>
				                          <MyInput type="text" name="facebookLink" id="facebookLink" ref="facebookLink" value={this.state.userData.facebookLink} placeholder="" handleChange={this.formValueChange} validations="isUrl"
				                          validationError="Please enter a valid URL." />
				                      </div>
				                      <div className="col-md-6">                                
				                          <label>Youtube</label>
				                          <MyInput type="text" name="youtubeLink" id="youtubeLink" ref="youtubeLink" value={this.state.userData.youtubeLink} placeholder="" handleChange={this.formValueChange} validations="isUrl"
				                          validationError="Please enter a valid URL." />
				                      </div>
				                      <div className="col-md-6">                                
				                          <label>Instagram</label>
				                          <MyInput type="text" name="instagramLink" id="instagramLink" ref="instagramLink" value={this.state.userData.instagramLink} placeholder="" handleChange={this.formValueChange} validations="isUrl"
				                          validationError="Please enter a valid URL." />
				                      </div>
				                      <div className="col-md-6">                                
				                          <label>Twitter</label>
				                          <MyInput type="text" name="twitterLInk" id="twitterLInk" ref="twitterLInk" value={this.state.userData.twitterLInk} placeholder="" handleChange={this.formValueChange} validations="isUrl"
				                          validationError="Please enter a valid URL." />
				                      </div>
				                    </div>
		                          </div>                          
		                    </div>

		                    <div className="yourbox2"> 
		                     <div className="row divrightside"> 
		                        <div className="col-md-6"> 
		                            <div className="text-left">
		                              <button type="button" className="btn btn-default btn-lg submitbtn backbtn">skip and complete later</button> 
		                            </div>                    
		                        </div>
		                        <div className="col-md-6 text-right"> 
		                            <div className="text-right">
		                            	<input type="submit" disabled={!this.state.canSubmit} className="btn btn-default btn-lg submitbtn" name="save" value="Save Profile and Publish" />
		                             	{/* <button type="button" className="btn btn-default btn-lg submitbtn">Save Profile and Publish</button> */}
		                            </div>
		                        </div>
		                      </div>
		                    </div>  
		                    </div>
			                </Formsy>
			            </div>
			          </div>   
			        </div>
			      </div>
			    </main>
			    <ProfilePicComponent modalOpen={this.state.profileModal} toggleFunction={this.profileToggle} handleProfileImage={this.handleProfileImage} handleSignedUrlData={this.handleSignedUrlProfileData}/>
			    <CoverPicComponent modalOpen={this.state.coverModal} toggleFunction={this.coverToggle} handleCoverImage={this.handleCoverImage} handleSignedUrlData={this.handleSignedUrlCoverData}/>
				<Footer/>
			</BlockUi>
			</div>
		)
	}
}

export default UserProfile;



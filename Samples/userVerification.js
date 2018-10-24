/* import react modules */
import React from 'react';
import { IndexLink, Link, Redirect } from 'react-router-dom';
import { Render } from 'react-dom';
import Alert from 'react-s-alert';
import BlockUi from 'react-block-ui';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Formsy from 'formsy-react';
import Countdown from 'react-countdown-now';

import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css';
import 'react-block-ui/style.css';

/* import helper file */
import Constants from '../../config/constants';
import {setCookie, getCookie, deleteCookie,updateUserValues,thumbnailUrlGenerator} from '../../config/helper';
import Message from '../../config/messages';
import MyInput from '../../config/formValidation';

class UserVerification extends React.Component {
	constructor(props) {
	    super(props);
	    let email = getCookie('email');
	    let publicCreatorSignup = localStorage.getItem("publicCreatorSignup");
	    let creatorId = localStorage.getItem("creatorId");

	    this.state = {
	      	blocking: false,
			canSubmit: false,
			verificationCode: "",
			email: email,
			publicCreatorSignup: publicCreatorSignup,
			creatorId: creatorId
	    }

	    /**** binding to make `this` work in the callback ***/
	    this.disableButton = this.disableButton.bind(this);
    	this.enableButton = this.enableButton.bind(this);
    	this.formValueChange = this.formValueChange.bind(this);
    	this.verifyUser = this.verifyUser.bind(this);
    	this.resendVerification = this.resendVerification.bind(this);
    	this.followCreator = this.followCreator.bind(this);
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
	    if (event.target.id == 'verificationCode') {
	    	this.setState({verificationCode: event.target.value});
	    }
  	}

  	/** function for follow creator functionality**/
	followCreator(followingId, token){
	    let _that = this;
	    _that.setState({ blocking: true});

	    /***** fetch API for follow creator starts **********/

	    fetch(Constants.SERVER_URL + '/api/v1/follow/', {
	      method: 'POST',
	      headers: {
	        'Accept': 'application/json',
	        'Content-Type': 'application/json',
	            'Authorization': token
	      },
	      body: JSON.stringify({
	        followingId: followingId
	      }),
	    }).then(function (response) {
	        let responseData = response.json();
	        responseData.then(function (data) {
	          if (data.status == 201) {
	            Alert.success('<h4>' + "You have start following this creator." + '</h4>', {
	              position: 'top',
	              effect: 'stackslide',
	              beep: false,
	              timeout: 3000
	            });
	            _that.setState({ blocking: false });
	    		_that.props.propValue.history.push("/creator-page/"+_that.state.creatorId);
	          } else if (data.status == 401) {
	            _that.setState({ blocking: false});
	          } else if (data.status == 404) {
	              Alert.error('<h4>' + data.message + '</h4>', {
	                position: 'top',
	                effect: 'stackslide',
	                beep: false,
	                timeout: 3000
	              });
	              _that.setState({ blocking: false});
	          } else if(data.status == 409){
	            Alert.error('<h4>' + data.message + '</h4>', {
	                position: 'top',
	                effect: 'stackslide',
	                beep: false,
	                timeout: 3000
	            });
	            _that.setState({ blocking: false });
	            _that.props.propValue.history.push("/creator-page/"+_that.state.creatorId);
	          } else {
	              Alert.error('<h4>' + Message.ERROR + '</h4>', {
	                position: 'top',
	                effect: 'stackslide',
	                beep: false,
	                timeout: 3000
	              });
	            _that.setState({ blocking: false });
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

	    /***** fetch API for follow creator ends **********/
	}

  	/**** function to handle verification of user ****/
  	verifyUser() {
	    let _that = this;
	    _that.setState({ blocking: true});

	    /***** fetch API for verify code starts **********/
	    fetch(Constants.SERVER_URL + '/api/v1/auth/sign-up-verification', {
	        method: 'PUT',
	        headers: {
	          'Accept': 'application/json',
	          'Content-Type': 'application/json',
	        },
	      	body: JSON.stringify({
	        	email: this.state.email,
	        	otp: this.state.verificationCode
	      	}),
	    }).then(function (response) {
	        let responseData = response.json();
	        responseData.then(function (data) {  
	          	if (data.status == 200) {
		            _that.setState({ blocking: false });
		            Alert.success('<h4>' + Message.VERIFY_CODE.SUCCESS + '</h4>', {
		              	position: 'top',
		              	effect: 'stackslide',
		              	beep: false,
		              	timeout: 3000
		            });

		            localStorage.setItem('token', data.data.token, 365);
    				localStorage.setItem('email', data.data.email, 365);
    				let thumbnailParameters = {
						originalUrl: data.data.profilePic,
						dimensions: "60x60",
						fileType: "profile"
            		}

		        	updateUserValues(data.data.fullname,data.data.isCreator,data.data.isProfileCompleted,thumbnailUrlGenerator(thumbnailParameters));
		        	setCookie("id", data.data.id, 365);
	    			_that.props.updateStateSignup();
	    			if(_that.state.publicCreatorSignup == 'true'){
	    				_that.followCreator(_that.state.creatorId,data.data.token);
	    			} else if(data.data.isCreator == true && _that.state.publicCreatorSignup == 'false'){
	    				_that.props.propValue.history.push("/creator");
	    			} else {
	    				_that.props.propValue.history.push("/user-profile");
	    			}
	          	} else if(data.status == 404){
		        	_that.setState({ blocking: false });
		        	Alert.error('<h4>' + Message.VERIFY_CODE.INVALID_CODE + '</h4>', {
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

    	/***** fetch API for verify code ends **********/
  	}

  	/**** function for resend verification code ****/
  	resendVerification(){
  		let _that = this;
	    _that.setState({blocking: true});

	    /***** fetch API for resend verification starts **********/
	    fetch(Constants.SERVER_URL + '/api/v1/auth/sign-up/resend-otp', {
	      	method: 'PUT',
	      	headers: {
		        'Accept': 'application/json',
		        'Content-Type': 'application/json',
	      	},
	      	body: JSON.stringify({
		        email: _that.state.email
	      	}),
	    }).then(function (response) {
	      	let responseData = response.json();
	      	responseData.then(function (data) { 
		        if (data.status == 200) {
		          	_that.setState({blocking: false});
		          	Alert.success('<h4>' + "Please check your email for a message with your code." + '</h4>', {
			            position: 'top',
			            effect: 'stackslide',
			            beep: false,
			            timeout: 3000
		          	});
		        } else if(data.status == 409){
	           		_that.setState({blocking: false});
	           		Alert.error('<h4>' + "You are already verified." + '</h4>', {
			            position: 'top',
			            effect: 'stackslide',
			            beep: false,
			            timeout: 3000
	          		});
	        	} else {
	          		_that.setState({blocking: false});
	          		Alert.error('<h4>' + Message.ERROR + '</h4>', {
			            position: 'top',
			            effect: 'stackslide',
			            beep: false,
			            timeout: 3000
	          		});
	        	}
	      	})
	    }).catch(function (error) {
	      	_that.setState({blocking: false});
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

	    /***** fetch API for resend verification ends **********/
  	}

  	/**** render view  ****/
	render(){
		return(
			<BlockUi blocking={this.state.blocking}>
			<div className="homesignup_page page_singin">
			<Alert html={true} />
			    <div className="homesignup_pageinner">
		          <div className="row forgotpassword_box">
		            <div className="col-lg-4 offset-lg-4 col-md-6 offset-md-3 verification_screen">
			            <div className="logo text-center">
			                <Link to="/" ><img src={Constants.CLOUDFRONT_URL+"/assets/images/logo-footer.png"} alt="test" /></Link>
			            </div>
					  	<h1>Verification Code</h1>
					  	<h5>Let us know if this email Id belongs to you. Enter the code in the mail sent to <span>{this.state.email}</span></h5>
				    	<Formsy onSubmit={this.verifyUser} onValid={this.enableButton} onInvalid={this.disableButton}  className="signup signin">
				            <label>Verification Code</label>
				            <div className="forgotPwd">
				            <MyInput type="text" name="verificationCode" id="verificationCode" ref="verificationCode" placeholder="xx-xx" handleChange={this.formValueChange} 
			                	validations={{
								  	isNumeric: true,
								  	isLength: 6
								}}
								validationErrors={{
								    isNumeric: 'Please enter valid code',
								    isLength: 'Verification Code must be of 6 digit.'
								}}
	          					required />
	          					<p className="timercode"><i className="fa fa-clock-o"></i> 
		          					<Countdown
									    date={Date.now() + (30*60*1000)}
									    renderer={renderer}
									  />
							    </p>
	          				</div>
				            <div className="text-center">
				              <input type="submit" disabled={!this.state.canSubmit} className="btn btn-default btn-lg submitbtn" name="" value="Continue" />
				            </div>
				            <p>Didn't receive the code? <a href="javascript:void(0)" onClick={this.resendVerification}>Resend Code</a></p>
				    	</Formsy>
				    </div>
				  </div>
		    	</div>
		    </div>
	        </BlockUi>
		)
	}
}

const Completionist = () => <span>Your verification code has been expired!</span>;

const renderer = ({ minutes, seconds, completed }) => {
  	if(completed) {
    	return <Completionist />;
  	} else {
    	return <span>{minutes}:{seconds}</span>;
  	}
};

export default UserVerification;
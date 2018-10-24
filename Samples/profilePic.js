/* import react modules */
import React from 'react';
import { IndexLink, Link, Redirect } from 'react-router-dom';
import { Render } from 'react-dom';
import Alert from 'react-s-alert';
import BlockUi from 'react-block-ui';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Formsy from 'formsy-react';
import axios from 'axios';
// import ReactCrop, { makeAspectCrop } from 'react-image-crop';
import Cropper from 'react-cropper';
import { confirmAlert } from 'react-confirm-alert';
import ReactFlowPlayer from "react-flow-player";

import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css';
import 'react-block-ui/style.css';
import 'cropperjs/dist/cropper.css';

/* import helper file */
import Constants from '../config/constants';
import {updateUserValues, dataURItoBlob} from '../config/helper';
import Message from '../config/messages';
import MyInput from '../config/formValidation';

class ProfilePicComponent extends React.Component {
  constructor(props){
    super(props);
    let token = localStorage.getItem('token');
      
    this.state = {
      blocking: false,
      canSubmit: false,
      token: token,
      profilePic: null,
      croppedImage: "",
      profileType: "IMAGE",
      profileImageUrl: "",
      profileExtension: "",
      profilePlayerId: "",
      signedUrl: "",
      targetFile: ""
    }

    /**** binding to make context of this to class ***/
    this.uploadProfilePic = this.uploadProfilePic.bind(this);
    this.handleProfileImageChange = this.handleProfileImageChange.bind(this);
    this.getCroppedImage = this.getCroppedImage.bind(this);
    this.resetModalValues = this.resetModalValues.bind(this);
    this.submit = this.submit.bind(this);
  }

  /* method that handle profile image selection */
  handleProfileImageChange(event) {
    if (event.target.files && event.target.files.length > 0) {
      var _that = this;
      _that.state.targetFile = event.target.files[0];
      _that.state.profileType = _that.state.targetFile.type.split("/")[0].toUpperCase();
      _that.state.profileExtension = _that.state.targetFile.type.split("/")[1];

      if(_that.state.profileType == "IMAGE"){
        if(_that.state.profileExtension == "gif"){
          var reader = new FileReader();
          reader.readAsDataURL(_that.state.targetFile);
          reader.onload = function (e) {
            var img = new Image();
            img.src = e.target.result;
            img.onload = function() {
              _that.setState({
                profilePic: reader.result,
              })
            }
          }
        } else {
          var reader = new FileReader();
          reader.readAsDataURL(_that.state.targetFile);
          reader.onload = function (e) {
            var img = new Image();
            img.src = e.target.result;
            img.onload = function() {
              var imageWidth = this.width;
              var imageHeight = this.height;
              if(imageWidth < 400 || imageHeight < 400){
                confirmAlert({
                customUI: ({ onClose }) => {
                  return (
                    <div className='confirm-alert_popup'>
                      <div className="modal" >
                        <div className="modal-dialog">
                          <div className="modal-content">
                              <div className="modal-header">
                                <h4 className="modal-title">Photo Too Small</h4>
                                <button type="button" className="close" onClick={onClose}>&times;</button>
                              </div>
                              <div className="modal-body">
                                <p>Please choose a profile pic that's at least 400 pixels width-height.</p>
                              </div>
                              <div className="modal-footer">
                                <button type="button" className="btn btn-find pull-right" onClick={onClose}>OK</button>
                              </div>
                          </div>
                        </div>
                      </div> 
                    </div>
                  )}
                })
              } else {
                _that.setState({
                  profilePic: reader.result,
                })
              }
            }
          }
        }
      } else if(_that.state.profileType == "VIDEO") {
        _that.uploadProfilePic(_that.state.targetFile);
      }  
    }
  }

  /**** function for geting cropped profile image ****/
  getCroppedImage(){
    // image in dataUrl
    let imageUrl = this.refs.cropper.getCroppedCanvas().toDataURL();
    this.setState({croppedImage:imageUrl});
  }

  /**** function to upload profile pic ****/
  uploadProfilePic(targetFile){
    this.setState({blocking : true});
    if(this.state.profileType == "VIDEO"){
      this.state.targetFile = targetFile;
    } else if(this.state.profileType == "IMAGE"){
      if(this.state.profileExtension != "gif"){
        this.state.targetFile = dataURItoBlob(this.state.croppedImage);
      }
    }

    var contentTypeName = "profile";
    let _that = this;
    axios.get(Constants.SERVER_URL + "/api/v1/generate-presigned-url", 
    { 
      headers: {'Authorization': _that.state.token},
      params: {fileType: _that.state.targetFile.type, contentType: contentTypeName }          
    }).then(function (response) {
        if(response.data.status == 200 ){
          _that.setState({signedUrl: response.data.data.preSignedUrl, profileImageUrl: response.data.data.preSignedUrl.split("?")[0], profileExtension: response.data.data.extension.split(".")[1], profilePlayerId: response.data.data.id, blocking: false });
          let imageUrl = '';
          if(_that.state.profileType == "IMAGE"){
            if(_that.state.profileExtension != "gif"){
              imageUrl = _that.state.croppedImage;
            } else {
              imageUrl = _that.state.profilePic;
            }
            _that.props.toggleFunction();
            _that.resetModalValues();
          }

          let profileImageParams = {
            imageUrl: imageUrl,
            profileExtension: _that.state.profileExtension,
            profilePlayerId: _that.state.profilePlayerId,
            profileType: _that.state.profileType
          }

          _that.props.handleProfileImage(profileImageParams);
          _that.props.handleSignedUrlData({signedUrl:_that.state.signedUrl,targetFile:_that.state.targetFile})
          
        } else {
          Alert.error('<h4>' + Message.ERROR + '</h4>', {
            position: 'top',
            effect: 'stackslide',
            beep: false,
            timeout: 3000
          });
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
      });   
  }

  /**** function to reset modal value ****/
  resetModalValues(){
    this.setState({profilePic: null, profileImageUrl: ""});
  }

  /**** function for submit video or gif type images ****/
  submit(){
    this.props.toggleFunction();
    this.resetModalValues();
  }

  /**** render view  ****/
  render(){
    let profilePicPreview = "";
    let buttonView = "";
    let profilePicCropperView = "";
    let uploadProfilePicCropperView = "";

    if(this.state.profileType == "VIDEO" && this.state.profileImageUrl != ""){
      buttonView = <input type="submit" name="submit" value="Submit" onClick={this.submit} />;
    } else if(this.state.profileType == "IMAGE" && this.state.profilePic != null){
      buttonView = <input type="submit" name="submit" value="Crop and Upload" onClick={this.uploadProfilePic} />;
    }

    if(this.state.profileType == "VIDEO"){
      profilePicPreview = <video className="embed-responsive-item" controls="controls">
                            <source src={this.state.profileImageUrl} type={"video"+ this.state.profileExtension} autostart="false" />;
                        </video>
    } else if(this.state.profileType == "IMAGE"){
      if(this.state.profileExtension != "gif"){
        profilePicPreview = <Cropper
                ref='cropper'
                src={this.state.profilePic}
                style={{height: 400, width: '100%'}}
                aspectRatio={4 / 4}
                guides={false}
                crop={this.getCroppedImage} />;
      } else {
        profilePicPreview = <img src={this.state.profilePic} alt="" />
      }
    }

    if(this.state.profileType == "VIDEO" && this.state.profileImageUrl != ""){
      profilePicCropperView = <div className="cover_picpreview">              
                {profilePicPreview}
               </div>;
    } else if(this.state.profileType == "IMAGE" && this.state.profilePic != null){
        profilePicCropperView = <div className="cover_picpreview">              
                {profilePicPreview}
               </div>;
    }

    if(this.state.profileType == "VIDEO" && this.state.profileImageUrl == ""){
      uploadProfilePicCropperView = <div className="uploadprofileimg">
                <label>Drag & Drop Profile picture here<b>or click to upload</b></label>
                <input type="file" onChange={this.handleProfileImageChange} accept="image/*" />
              </div>;;
    } else if(this.state.profileType == "IMAGE" && this.state.profilePic == null){
        uploadProfilePicCropperView = <div className="uploadprofileimg">
                <label>Drag & Drop Profile picture here<b>or click to upload</b></label>
                <input type="file" onChange={this.handleProfileImageChange} accept="image/*" />
              </div>;;
    }

    return(
      <Modal isOpen={this.props.modalOpen} toggle={this.props.toggleFunction} className="cropeimagepopup">
        <BlockUi blocking={this.state.blocking}>
        {/*  <ModalHeader toggle={this.props.toggleFunction} ></ModalHeader>*/}
          <ModalBody>
            <div className="App">
              {uploadProfilePicCropperView}
              {profilePicCropperView}
            </div>
          </ModalBody>          
          <ModalFooter>
            <p><i className="fa fa-arrows-alt"></i>Drag and resize frame to reposition</p>
            {buttonView}
            <button className='btn btn-default' onClick={this.submit}>Cancel</button>
          </ModalFooter>
        </BlockUi>
      </Modal>
    )
  }
}

export default ProfilePicComponent;

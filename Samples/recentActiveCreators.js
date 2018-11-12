/* import react modules  */
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Link, Redirect, withRouter, NavLink } from 'react-router-dom';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import Alert from 'react-s-alert';
import BlockUi from 'react-block-ui';
import $ from "jquery";
import ContentLoader, { Facebook } from 'react-content-loader';
import InfiniteScroll from 'react-infinite-scroll-component';

import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css';

/* import helper file */
import Constants from '../../config/constants';
import {setCookie, getCookie, deleteCookie, setContentType, getContentType, refresh, updateUserValues,thumbnailUrlGenerator} from '../../config/helper';
import Message from '../../config/messages';

export default class ActiveCreators extends React.Component {
	constructor(props) {
    	super(props);
  	}

  	/**** render view  ****/
	render(){
		let activeCreatorsList = '';
	    let showMoreView = '';
	    if(this.props.recentActiveCreators.recentActiveCreatorData != undefined && this.props.recentActiveCreators.recentActiveCreatorData != null && this.props.recentActiveCreators.recentActiveCreatorData != ''){
	      	let recentActiveCreatorData = this.props.recentActiveCreators.recentActiveCreatorData;
	      	activeCreatorsList = recentActiveCreatorData.map((creator,index) => {
		      	let exactURL = '/';
		        let urlProfile = "creator-page/"+creator.id;
		        let profilePicView = '';
		        let thumbnailParametersProfile = {
		          	originalUrl: creator.profilePic,
		          	dimensions: "60x60",
		          	fileType: "profile"
		        }

		        if(creator.profilePic == undefined || creator.profilePic == '' || creator.profilePic == null){
		          	profilePicView = <img src={Constants.CLOUDFRONT_URL+"/profile/1533192186943_default.png"} alt={creator.username} width="68px" />;
		        } else {
		          	profilePicView = <img src={thumbnailUrlGenerator(thumbnailParametersProfile)} alt={creator.username} width="68px"  />;
		        }

		        return(
		          	<div className="listsuggested" key={creator.id}>
		          		<div className="row">
				            <div className="col-4">
				              	<NavLink to={`${exactURL+urlProfile}`}>
				                  	{profilePicView}
				              		<span className="userroll">Creator</span>
				              	</NavLink>
				            </div>
				            <div className="col-8">
				              	<NavLink to={`${exactURL+urlProfile}`}><h4>{creator.username}</h4></NavLink>
				              	<p>is creating {creator.creatorCategory}</p>
				            </div>
		          		</div>
		        	</div>
		        )
	      	})
	    }

	    if(this.props.recentActiveCreators.totalCreatorCount > 5) {
	      	showMoreView = <div className="text-center">
	           	<Link to="/recent-active-creators" className="seemore" href="javascript:void(0)" id="seemoresugges">Show More</Link>
	        </div>;
	    } else {
	      	showMoreView = ''
	    }

	    if(this.props.recentActiveCreators.totalCreatorCount > 0) {
	      return(
	        <div className="widgets followcreator">
	          	<h2>Recently Active Creators</h2>
	          	{activeCreatorsList}
	          	{showMoreView}         
	        </div> 
	      )
	    } else {
	      return '';
	    }
	}
}
/* import react modules  */
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Link, Redirect, withRouter, NavLink } from 'react-router-dom';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import Alert from 'react-s-alert';
import Autosuggest from 'react-autosuggest';

import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css';

/* import helper file */
import Constants from '../../config/constants';
import {setCookie, getCookie, deleteCookie,updateUserValues, getSearchResult} from '../../config/helper';
import Message from '../../config/messages';
import MyInput from '../../config/formValidation';

class SearchBox extends React.Component {
	constructor(props) {
	    super(props);
	    let token = localStorage.getItem('token');

	    this.state = {
	    	blocking: false,
	    	token: token,
	      	value: '',
      		suggestions: [],
      		noSuggestions: false,
      		isLoading: false,
      		searchContent: [],
      		searchType: "ALL",
      		createdAt:"",
      		delayTimer: 0,
      		recentSearch: false
	    }
	    
	    /**** binding to make context of this to class ***/
	    this.onChange = this.onChange.bind(this);
	    this.onKeyPress = this.onKeyPress.bind(this);
	    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
	    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
	    this.shouldRenderSuggestions = this.shouldRenderSuggestions.bind(this);
	    this.getSuggestions = this.getSuggestions.bind(this);
	    this.getSearchResultData = this.getSearchResultData.bind(this);
	    this.getRecentSearchReult = this.getRecentSearchReult.bind(this);
	    this.getSuggestionValue = this.getSuggestionValue.bind(this);
	    this.renderSuggestion = this.renderSuggestion.bind(this);
	    // this.debouncedLoadSuggestions = _.debounce(this.loadSuggestions, 1000);
	}

	/**** function to handle onChange event on search bar ****/
	onChange(event, { newValue }) {
	    this.setState({
	      	value: newValue
	    });
  	}

  	getSearchResultData(value){
  		var _that = this;
    	_that.setState({ blocking: true, recentSearch: false});

  		/***** fetch API for search data starts **********/    
	    return new Promise(function(resolve,reject){
		    fetch(Constants.SERVER_URL + '/api/v1/search/'+value, {
		      	method: 'GET',
		      	headers: {
			        'Accept': 'application/json',
			        'Content-Type': 'application/json',
			        'Authorization': _that.state.token
		      	},
		    }).then(function (response) {
		      	let responseData = response.json();
		      	responseData.then(function (data) {
			        if(data.status == 200) {
          				_that.setState({searchContent: data.data, blocking: false});
          				resolve(data.data);
	        		} else if(data.status == 403) {
	          			_that.setState({ blocking: false });
	          			reject();
	        		} else if(data.status == 401) {
	          			_that.setState({ blocking: false});
	          			reject();
	        		} else {
	          			_that.setState({ blocking: false});
			          	Alert.error('<h4>' + Message.ERROR + '</h4>', {
				            position: 'top',
				            effect: 'stackslide',
				            beep: false,
				            timeout: 3000
		          		});
		          		reject();
	        		}
	      		})
			}).catch(function (error) {
	    		_that.setState({ blocking: false});
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
		});

	    /***** fetch API for search data ends **********/
  	}

 	/**** function to get suggestion list from the API ****/
  	getSuggestions(value){
  		let _that = this;
  		if(!value || value.length == 0) {
  			return new Promise(function(resolve,reject){
	  			const inputValue = value.trim().toLowerCase();
			  	const inputLength = inputValue.length;
				_that.getRecentSearchReult(value).then(function(data){
				 	let res;
			    	if(inputLength == 0){
				    	res = _that.state.searchContent.filter((search) => {
						    	if(search.content.toLowerCase().slice(0, inputLength) === inputValue){
						    		return search;
						    	}
						    	else{
						    		return;
						    	}
						  	}
					  	);
			    	}

			    	resolve(res);
				}).catch(function (error) {
				    reject();
				});
	  		});	
  		} else {
  			return new Promise(function(resolve,reject){
	  			const inputValue = value.trim().toLowerCase();
			  	const inputLength = inputValue.length;
				_that.getSearchResultData(value).then(function(data){
				 	let res;
			    	if(inputLength != 0){
				    	res = _that.state.searchContent.filter((search) => {
						    	if(search.content.toLowerCase().slice(0, inputLength) === inputValue){
						    		return search;
						    	}
						    	else{
						    		return;
						    	}
						  	}
					  	);
			    	}

			    	resolve(res);
				}).catch(function (error) {
				      	reject();
				    });
	  		});	
  		}  	
	}
 	
 	/**** function for fetching value from suggested values ****/
  	onSuggestionsFetchRequested({ value }) {
  		const isInputBlank = value.trim() === '';
  		let _that =this ; 
		clearTimeout(_that.state.delayTimer); 
		_that.setState({
			delayTimer: setTimeout(function() { 
				_that.getSuggestions(value).then(function(suggestion){
		    		const noSuggestions = !isInputBlank && suggestion.length === 0;
		  			_that.setState({
				      	suggestions: suggestion || [],
				      	noSuggestions: noSuggestions
				    });
		  		})
			}, 250)
		})	    
  	}
 	
 	/**** predefined function ****/
  	onSuggestionsClearRequested() {
	    this.setState({
	      	suggestions: []
	    });
  	}

  	/** function for enter event  **/ 
  	onKeyPress(event) {
  		if(event.target.value != undefined && event.target.value != ''){
	        if(event.key === 'Enter'){
	            this.props.propValue.history.push("/search/top/"+ event.target.value);
	        }
  		}
    }

  	/** function to get recent search result data  **/ 
    getRecentSearchReult(event){
    	
		var _that = this;
    	_that.setState({blocking: true, recentSearch: true});
	    return new Promise(function(resolve,reject){
	    	/***** fetch API for recent search data starts **********/ 
		    fetch(Constants.SERVER_URL + '/api/v1/recent-search', {
		      	method: 'GET',
		      	headers: {
			        'Accept': 'application/json',
			        'Content-Type': 'application/json',
			        'Authorization': _that.state.token
		      	},
		    }).then(function (response) {
		      	let responseData = response.json();
		      	responseData.then(function (data) {
			        if(data.status == 200) {
	      				_that.setState({searchContent: data.data, blocking: false});
	      				resolve(data.data);
	        		} else if(data.status == 404) {
	          			_that.setState({ blocking: false });
	          			reject();
	        		} else if(data.status == 401) {
	          			_that.setState({ blocking: false});
	          			reject();
	        		} else {
	          			_that.setState({ blocking: false});
			          	Alert.error('<h4>' + Message.ERROR + '</h4>', {
				            position: 'top',
				            effect: 'stackslide',
				            beep: false,
				            timeout: 3000
		          		});
		          		reject();
	        		}
	      		})
			}).catch(function (error) {
	    		_that.setState({ blocking: false});
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

	    	/***** fetch API for recent search data ends **********/
    	});
    }

    shouldRenderSuggestions(value) {
    	return value.trim().length == 0;
	}


 	getSuggestionValue(suggestion) {
 		return suggestion.content;
 	}

    renderSuggestion(suggestion ) {
		let recentSearchView = '';
		if(this.state.recentSearch == true){
			recentSearchView = <div className="recent-search"> Recent Search Results </div>;
		}

		return(
			<div>
				{recentSearchView}		
				<Link to={`${"/search/top/"+ suggestion.content}`}>{suggestion.content}</Link>
			</div>
		)
	}			
  	
  	/**** render view  ****/
	render(){
		const { value, suggestions, noSuggestions } = this.state;
		const inputProps = {
      		placeholder: 'Type here what are you looking for...',
      		value,
      		onChange: this.onChange,
            onKeyPress: this.onKeyPress,
            onFocus: this.getRecentSearchReult
    	}

		return(
	        <div className="headerserchbox">
	        	<Autosuggest
			        suggestions={suggestions}
			        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
			        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
			        getSuggestionValue={this.getSuggestionValue}
			        renderSuggestion={this.renderSuggestion}
			        inputProps={inputProps}
			        shouldRenderSuggestions={this.shouldRenderSuggestions}
			        alwaysRenderSuggestions={true}
      			/>
      			{
          			noSuggestions &&
		            <div className="no-suggestions">
		              	No suggestions found!
		            </div>
        		}
	        </div>
		)
	}
}

export default SearchBox;

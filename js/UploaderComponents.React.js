/** @jsx React.DOM */
var Uploader = React.createClass({
	
	getInitialState: function(){
		return { files: [], isUploading: false};
	},
	
	handleInputChange: function(filesSelector) {
		var files = [];
		
		for(var i = 0; i < filesSelector.files.length; i++) {
			filesSelector.files[i].isUploaded = false;
			filesSelector.files[i].isUploading = false;
			filesSelector.files[i].uploadPercentage = 0;
			files.push(filesSelector.files[i]);
		}
		
		this.setState( {files: files, isUploading: false});
	},
	
	startUpload: function() {
		self = this;
		files = this.state.files;
		for(var i = 0; i < files.length; i++) {
			fd = new FormData();
			fd.append("file", files[i]);
			
		    $.ajax({
		        url: self.props.uploadURL,  //Server script to process data
		        type: 'POST',
		        xhr: function() {  // Custom XMLHttpRequest
		            var myXhr = $.ajaxSettings.xhr();
		            ajaxObj = this;
		            
		            // Custom attribute for tracking file uploading
		            myXhr.upload.fileIndex = i;
		            
		            if(myXhr.upload){
		                myXhr.upload.onprogress = function(e) {
					    	if (e.lengthComputable) {
								var percentage = (e.loaded / e.total) * 100;
								
								self.state.files[ this.fileIndex ].uploadPercentage = percentage;
								self.setState({  });
					    	}
					    };
		            }
		            return myXhr;
		        },
		        //Ajax events
		        beforeSend: function() {},
		        success: function(res) { },
		        error: function() {},
		        // Form data
		        data: fd,
		        //Options to tell jQuery not to process data or worry about content-type.
		        cache: false,
		        contentType: false,
		        processData: false,
		        // Custome attribute
		        fileIndex: i
		    });

			this.state.files[i].isUploading = true;
		}
		
		this.setState({ isUploading: true });	
	},
	
	handleUserRemoveFile: function(fileName) {
		var files = this.state.files;
		for(var i = 0; i < files.length; i++) {
			
			if(fileName == files[i].name) {
				files.splice(i,1);
				break;
			}
		}
		
		this.setState( { files: files } );
	},
	
	render: function() {
		self = this;
		var filesList = this.state.files.map( function(f) {
			return ( 
				<FileItem fileName={f.name} onRemove={self.handleUserRemoveFile} hideRemoveButton={self.state.isUploading} uploadPercent={ f.uploadPercentage } />
			);
		});
		
		startButtonHidden = (!filesList.length || this.state.isUploading) ? 'hidden' : '';
		
    	return (
    		<div>
				<FileSelector onChange={this.handleInputChange} isUploading={ this.state.isUploading } />
				<ul id='fileList' className={'center-block ' + (filesList.length ? '' : 'hidden')}>
					{filesList}
				</ul>
				<button onClick={this.startUpload} className={'btn btn-primary center-block ' + startButtonHidden} role='button'>Start Upload</button>
			</div>
		);
	}
});

/** Generate a fake button to choose files for uploading */
var FileSelector = React.createClass({
	
	onClickBtn: function(evt) {
		$(evt.target).next().click();
	},
	
	// Transfer object file input to Uploader
	onChange: function(evt) {
		this.props.onChange(evt.target);
	},
	
	render: function() {
		var hideFileInputClass = this.props.isUploading ? 'hidden' : '';
		
		return (
			<p className={'text-center ' + hideFileInputClass}>
				<a onClick={this.onClickBtn} className='btn btn-primary' role='button'>Choose files</a>
				<input onChange={this.onChange} id="file_input" className='hidden' type="file" multiple />
			</p>
		);
	}
});

var FileItem = React.createClass({
	
	onFileRemove: function(evt) {
		this.props.onRemove( this.props.fileName );
	},
	
	render: function() {
		
		progressBarVisible = (this.props.uploadPercent < 100) ? '' : 'hidden';
		
		return (
			<li fileName={this.props.fileName}>
				<div className={'progressbar ' + progressBarVisible} style={{width: this.props.uploadPercent+'%'}} ></div>
				<span className='text'><i className="fa fa-file-text-o"></i> {this.props.fileName}</span>
				<span className={'action ' + (this.props.hideRemoveButton ? 'hidden' : '') } onClick={this.onFileRemove}><i className="fa fa-trash-o"></i></span>
			</li>
		);
	}
});
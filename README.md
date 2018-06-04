Splash Jade/Less Basic Template (Still suppoer IE 8)
version 1.0

Framewrok:
	Bootstrap v3.3.7
	jQuery v1.12.4


Notes:

1. CSS:
    - Fonts file will loaded by js to avoid blocking html parsing so all fonts face need put in fonts-face.less (and fonts-chrome.less -fix for chrome on Win 7)
    - If you use a external plugin, you just put the plugin less file into folder: less/libs


2. JS:
    - JS library (jquery,modernizr,html5shiv,respond or anything script not merge to 1 file ) will put in js/libs folder while all JS plugins will put in js/libs/plugins folder as separate files.
    - All files in folder js/libs/plugins will minified and merge as plugins.min.js (duplicate from plugin-template.js and follow this plugin structure)


FOLDER STRUCTURE

- app/
	- fonts/								: contain fonts source
	- images/								: contain images
		- upload/							: contain images will be upload
	- js								: contain js files
		- libs/								: contain pre-write common library (should not edit)
			- plugins/					: contain pre-write common plugin (should not edit)
		- plugins/						: contain manual plugin (if you want to write plugin, please duplicate plugins.js file)
	- less							: contain less files
		- blocks/							: less file for blocks/widget in page
		- css									: css file (bootstrap.min.css, v.v...)
		- libs/								: put the external plugin less files which we find online
		- pages/							: less file for specfied pages
	- pdf
	- psd								: put the PSD file for sprite icon
	- views							: contain jade files
		- includes/						: put the common/reuse files (etc: header/footer)
		- layout/							: put the layout file
		- minxin/							: put the mixin jade file
    
##########################

### Install enviroments ###

npm install


##########################

METHODS:

gulp										:	this is default method to build develop enviroment

gulp deploy							:	this is method to build source only without develop server and code not be compressed

gulp compressed					:	this is method to build source only without develop server and code is compressed

*Added gulp tinypng*

gulp tinypng					:  This is method make images compress into folder public/images_compressed



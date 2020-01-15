(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("bluebird"), require("@google-cloud/storage"), require("path"), require("recursive-readdir"));
	else if(typeof define === 'function' && define.amd)
		define(["bluebird", "@google-cloud/storage", "path", "recursive-readdir"], factory);
	else if(typeof exports === 'object')
		exports["webpack-google-cloud-storage-plugin"] = factory(require("bluebird"), require("@google-cloud/storage"), require("path"), require("recursive-readdir"));
	else
		root["webpack-google-cloud-storage-plugin"] = factory(root["bluebird"], root["@google-cloud/storage"], root["path"], root["recursive-readdir"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_6__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	// import merge from 'lodash.merge';


	var _bluebird = __webpack_require__(1);

	var _bluebird2 = _interopRequireDefault(_bluebird);

	var _propTypes = __webpack_require__(2);

	var _propTypes2 = _interopRequireDefault(_propTypes);

	var _storage = __webpack_require__(3);

	var _path = __webpack_require__(4);

	var _path2 = _interopRequireDefault(_path);

	var _utils = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var recursive = _bluebird2.default.promisify(__webpack_require__(6));

	var pluginName = "WebpackGoogleCloudStoragePlugin";

	function makePublic(storage, bucketName, destinationFilePath) {
	  storage.bucket("" + bucketName).file(destinationFilePath).makePublic().then(function () {
	    console.log("gs://" + bucketName + "/" + destinationFilePath + " is now public.");
	  }).catch(function (err) {
	    console.error("Failed to make " + destinationFilePath + " public...", err);
	  });
	}

	function uploadFile(storage, bucketName, file, destinationFilePath, pub) {
	  storage.bucket("" + bucketName).upload(file.path, {
	    gzip: true,
	    destination: destinationFilePath,
	    metadata: {
	      cacheControl: "no-cache"
	    }
	  }).then(function () {
	    console.log("Uploaded " + file.path + " to gs://" + bucketName + "/" + file.path);
	    if (pub) {
	      makePublic(storage, bucketName, destinationFilePath);
	    }
	  }).catch(function (err) {
	    return console.error(err);
	  });
	}

	var hook = function hook(compiler, cb) {
	  // new webpack
	  if (compiler.hooks) {
	    compiler.hooks.afterEmit.tapAsync(pluginName, cb);
	    return;
	  }
	  // old webpack
	  compiler.plugin("after-emit", cb);
	};

	module.exports = function () {
	  _createClass(WebpackGoogleCloudStoragePlugin, null, [{
	    key: "defaultDestinationNameFn",
	    value: function defaultDestinationNameFn(file) {
	      return file.path;
	    }

	    /**
	     * Return an object following this schema:
	     *
	     * - https://cloud.google.com/nodejs/docs/reference/storage/2.0.x/Bucket#upload
	     * - https://cloud.google.com/storage/docs/json_api/v1/objects/insert#request_properties_JSON
	     * - Example: https://github.com/googleapis/nodejs-storage/blob/master/samples/files.js#L119
	     *
	     * @param {*} file { path: string }
	     */

	  }, {
	    key: "defaultMetadataFn",
	    value: function defaultMetadataFn() /* file */{
	      return {};
	    }
	  }, {
	    key: "getAssetFiles",
	    value: function getAssetFiles(_ref) {
	      var assets = _ref.assets;

	      var files = assets.map(function (value, name) {
	        return { name: name, path: value.existsAt };
	      });
	      return _bluebird2.default.resolve(files);
	    }
	  }, {
	    key: "handleErrors",
	    value: function handleErrors(error, compilation, cb) {
	      compilation.errors.push(new Error(pluginName + ": " + error.stack));
	      cb();
	    }
	  }, {
	    key: "schema",
	    get: function get() {
	      return {
	        directory: _propTypes2.default.string,
	        include: _propTypes2.default.array,
	        exclude: _propTypes2.default.array,
	        storageOptions: _propTypes2.default.object.isRequired,
	        uploadOptions: _propTypes2.default.shape({
	          bucketName: _propTypes2.default.string.isRequired,
	          forceCreateBucket: _propTypes2.default.bool,
	          gzip: _propTypes2.default.bool,
	          public: _propTypes2.default.bool,
	          destinationNameFn: _propTypes2.default.func,
	          metadataFn: _propTypes2.default.func,
	          makePublic: _propTypes2.default.bool,
	          resumable: _propTypes2.default.bool,
	          concurrency: _propTypes2.default.number
	        })
	      };
	    }
	  }, {
	    key: "ignoredFiles",
	    get: function get() {
	      return [".DS_Store"];
	    }
	  }]);

	  function WebpackGoogleCloudStoragePlugin() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    _classCallCheck(this, WebpackGoogleCloudStoragePlugin);

	    _propTypes2.default.validateWithErrors(this.constructor.schema, options, pluginName);

	    this.isConnected = false;

	    this.storageOptions = options.storageOptions;
	    this.uploadOptions = options.uploadOptions;
	    this.uploadOptions.destinationNameFn = this.uploadOptions.destinationNameFn || this.constructor.defaultDestinationNameFn;
	    this.uploadOptions.metadataFn = this.uploadOptions.metadataFn || this.constructor.defaultMetadataFn;

	    this.options = (0, _utils.pick)(options, ["directory", "include", "exclude", "basePath"]);

	    this.options.exclude = this.options.exclude || [];
	  }

	  _createClass(WebpackGoogleCloudStoragePlugin, [{
	    key: "connect",
	    value: function connect() {
	      if (this.isConnected) {
	        return;
	      }

	      this.client = new _storage.Storage(this.storageOptions);
	      this.isConnected = true;
	    }
	  }, {
	    key: "filterFiles",
	    value: function filterFiles(files) {
	      var _this = this;

	      return _bluebird2.default.resolve(files.filter(function (file) {
	        return _this.isIncluded(file.name) && !_this.isExcluded(file.name) && !_this.isIgnored(file.name);
	      }));
	    }
	  }, {
	    key: "isIncluded",
	    value: function isIncluded(fileName) {
	      return this.options.include.some(function (include) {
	        return fileName.match(new RegExp(include));
	      });
	    }
	  }, {
	    key: "isExcluded",
	    value: function isExcluded(fileName) {
	      return this.options.exclude.some(function (exclude) {
	        return fileName.match(new RegExp(exclude));
	      });
	    }
	  }, {
	    key: "isIgnored",
	    value: function isIgnored(fileName) {
	      return this.constructor.ignoredFiles.some(function (ignoredFile) {
	        return fileName.match(new RegExp(ignoredFile));
	      });
	    }
	  }, {
	    key: "handleFiles",
	    value: function handleFiles(files) {
	      var _this2 = this;

	      return this.filterFiles(files).then(function (filteredFiles) {
	        return _this2.uploadFiles(filteredFiles);
	      });
	    }
	  }, {
	    key: "apply",
	    value: function apply(compiler) {
	      var _this3 = this;

	      this.connect();

	      // NOTE: Use specified directory, webpack.config.output or current dir.
	      this.options.directory = this.options.directory || compiler.options.output.path || compiler.options.output.context || ".";
	      hook(compiler, function (compilation, cb) {
	        if (_this3.options.directory) {
	          recursive(_this3.options.directory, _this3.options.exclude).then(function (files) {
	            return files.map(function (f) {
	              return { name: _path2.default.basename(f), path: f };
	            });
	          }).then(function (files) {
	            return _this3.handleFiles(files);
	          }).then(function () {
	            return cb();
	          }).catch(function (e) {
	            return _this3.constructor.handleErrors(e, compilation, cb);
	          });
	        } else {
	          _this3.constructor.getAssetFiles(compilation).then(function (files) {
	            return _this3.handleFiles(files);
	          }).then(function () {
	            return cb();
	          }).catch(function (e) {
	            return _this3.constructor.handleErrors(e, compilation, cb);
	          });
	        }
	      });
	    }
	  }, {
	    key: "uploadFiles",
	    value: function uploadFiles() {
	      var _this4 = this;

	      var files = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

	      // const bucket = this.client.bucket(this.uploadOptions.bucketName);
	      // see https://hackernoon.com/concurrency-control-in-promises-with-bluebird-977249520f23
	      // http://bluebirdjs.com/docs/api/promise.map.html#map-option-concurrency
	      return _bluebird2.default.map(files, function (file) {
	        return uploadFile(_this4.client, _this4.uploadOptions.bucketName, file, _this4.uploadOptions.destinationNameFn(file),
	        // file.path,
	        true);
	      }
	      //   bucket.upload(file.path, {
	      //     destination: this.uploadOptions.destinationNameFn(file),
	      //     gzip: this.uploadOptions.gzip || false,
	      //     public: this.uploadOptions.makePublic || false,
	      //     resumable: this.uploadOptions.resumable,
	      //     metadata: this.uploadOptions.metadataFn(file)
	      //   }),
	      // { concurrency: this.uploadOptions.concurrency || 10 }
	      );
	    }
	  }]);

	  return WebpackGoogleCloudStoragePlugin;
	}();

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = require("bluebird");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports =
	/******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};

	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {

	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;

	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};

	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;

	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}


	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;

	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;

	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";

	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

		var PropTypes = _interopRequire(__webpack_require__(1));

		var validate = _interopRequire(__webpack_require__(2));

		var validateWithErrors = _interopRequire(__webpack_require__(3));

		var assign = Object.assign || function (target) {
		  for (var i = 1; i < arguments.length; i++) {
		    var source = arguments[i];
		    for (var key in source) {
		      if (Object.prototype.hasOwnProperty.call(source, key)) {
		        target[key] = source[key];
		      }
		    }
		  }
		  return target;
		};

		module.exports = assign({}, PropTypes, { validate: validate, validateWithErrors: validateWithErrors });

	/***/ },
	/* 1 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		/**
		 * Copyright 2013-2015, Facebook, Inc.
		 * All rights reserved.
		 *
		 * This source code is licensed under the BSD-style license found in the
		 * LICENSE file in the root directory of this source tree. An additional grant
		 * of patent rights can be found in the PATENTS file in the same directory.
		 *
		 */

		function nullFunction() {
		  return null;
		}

		var ANONYMOUS = "<<anonymous>>";

		// Equivalent of `typeof` but with special handling for array and regexp.
		function getPropType(propValue) {
		  var propType = typeof propValue;
		  if (Array.isArray(propValue)) {
		    return "array";
		  }
		  if (propValue instanceof RegExp) {
		    // Old webkits (at least until Android 4.0) return 'function' rather than
		    // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
		    // passes PropTypes.object.
		    return "object";
		  }
		  return propType;
		}

		function createChainableTypeChecker(validate) {
		  function checkType(isRequired, props, propName, descriptiveName, location) {
		    descriptiveName = descriptiveName || ANONYMOUS;
		    if (props[propName] == null) {
		      var locationName = location;
		      if (isRequired) {
		        return new Error("Required " + locationName + " `" + propName + "` was not specified in " + ("`" + descriptiveName + "`."));
		      }
		      return null;
		    } else {
		      return validate(props, propName, descriptiveName, location);
		    }
		  }

		  var chainedCheckType = checkType.bind(null, false);
		  chainedCheckType.isRequired = checkType.bind(null, true);

		  return chainedCheckType;
		}

		function createPrimitiveTypeChecker(expectedType) {
		  function validate(props, propName, descriptiveName, location) {
		    var propValue = props[propName];
		    var propType = getPropType(propValue);
		    if (propType !== expectedType) {
		      var locationName = location;
		      // `propValue` being instance of, say, date/regexp, pass the 'object'
		      // check, but we can offer a more precise error message here rather than
		      // 'of type `object`'.
		      var preciseType = getPreciseType(propValue);

		      return new Error("Invalid " + locationName + " `" + propName + "` of type `" + preciseType + "` " + ("supplied to `" + descriptiveName + "`, expected `" + expectedType + "`."));
		    }
		    return null;
		  }
		  return createChainableTypeChecker(validate);
		}

		function createAnyTypeChecker() {
		  return createChainableTypeChecker(nullFunction);
		}

		function createArrayOfTypeChecker(typeChecker) {
		  function validate(props, propName, descriptiveName, location) {
		    var propValue = props[propName];
		    if (!Array.isArray(propValue)) {
		      var locationName = location;
		      var propType = getPropType(propValue);
		      return new Error("Invalid " + locationName + " `" + propName + "` of type " + ("`" + propType + "` supplied to `" + descriptiveName + "`, expected an array."));
		    }
		    for (var i = 0; i < propValue.length; i++) {
		      var error = typeChecker(propValue, i, descriptiveName, location);
		      if (error instanceof Error) {
		        return error;
		      }
		    }
		    return null;
		  }
		  return createChainableTypeChecker(validate);
		}

		function createInstanceTypeChecker(expectedClass) {
		  function validate(props, propName, descriptiveName, location) {
		    if (!(props[propName] instanceof expectedClass)) {
		      var locationName = location;
		      var expectedClassName = expectedClass.name || ANONYMOUS;
		      return new Error("Invalid " + locationName + " `" + propName + "` supplied to " + ("`" + descriptiveName + "`, expected instance of `" + expectedClassName + "`."));
		    }
		    return null;
		  }
		  return createChainableTypeChecker(validate);
		}

		function createEnumTypeChecker(expectedValues) {
		  function validate(props, propName, descriptiveName, location) {
		    var propValue = props[propName];
		    for (var i = 0; i < expectedValues.length; i++) {
		      if (propValue === expectedValues[i]) {
		        return null;
		      }
		    }

		    var locationName = location;
		    var valuesString = JSON.stringify(expectedValues);
		    return new Error("Invalid " + locationName + " `" + propName + "` of value `" + propValue + "` " + ("supplied to `" + descriptiveName + "`, expected one of " + valuesString + "."));
		  }
		  return createChainableTypeChecker(validate);
		}

		function createObjectOfTypeChecker(typeChecker) {
		  function validate(props, propName, descriptiveName, location) {
		    var propValue = props[propName];
		    var propType = getPropType(propValue);
		    if (propType !== "object") {
		      var locationName = location;
		      return new Error("Invalid " + locationName + " `" + propName + "` of type " + ("`" + propType + "` supplied to `" + descriptiveName + "`, expected an object."));
		    }
		    for (var key in propValue) {
		      if (propValue.hasOwnProperty(key)) {
		        var error = typeChecker(propValue, key, descriptiveName, location);
		        if (error instanceof Error) {
		          return error;
		        }
		      }
		    }
		    return null;
		  }
		  return createChainableTypeChecker(validate);
		}

		function createUnionTypeChecker(arrayOfTypeCheckers) {
		  function validate(props, propName, descriptiveName, location) {
		    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
		      var checker = arrayOfTypeCheckers[i];
		      if (checker(props, propName, descriptiveName, location) == null) {
		        return null;
		      }
		    }

		    var locationName = location;
		    return new Error("Invalid " + locationName + " `" + propName + "` supplied to " + ("`" + descriptiveName + "`."));
		  }
		  return createChainableTypeChecker(validate);
		}

		function createShapeTypeChecker(shapeTypes) {
		  function validate(props, propName, descriptiveName, location) {
		    var propValue = props[propName];
		    var propType = getPropType(propValue);
		    if (propType !== "object") {
		      var locationName = location;
		      return new Error("Invalid " + locationName + " `" + propName + "` of type `" + propType + "` " + ("supplied to `" + descriptiveName + "`, expected `object`."));
		    }
		    for (var key in shapeTypes) {
		      var checker = shapeTypes[key];
		      if (!checker) {
		        continue;
		      }
		      var error = checker(propValue, key, descriptiveName, location);
		      if (error) {
		        return error;
		      }
		    }
		    return null;
		  }
		  return createChainableTypeChecker(validate);
		}

		// This handles more types than `getPropType`. Only used for error messages.
		// See `createPrimitiveTypeChecker`.
		function getPreciseType(propValue) {
		  var propType = getPropType(propValue);
		  if (propType === "object") {
		    if (propValue instanceof Date) {
		      return "date";
		    } else if (propValue instanceof RegExp) {
		      return "regexp";
		    }
		  }
		  return propType;
		}

		module.exports = {
		  array: createPrimitiveTypeChecker("array"),
		  bool: createPrimitiveTypeChecker("boolean"),
		  func: createPrimitiveTypeChecker("function"),
		  number: createPrimitiveTypeChecker("number"),
		  object: createPrimitiveTypeChecker("object"),
		  string: createPrimitiveTypeChecker("string"),

		  any: createAnyTypeChecker(),
		  arrayOf: createArrayOfTypeChecker,
		  instanceOf: createInstanceTypeChecker,
		  objectOf: createObjectOfTypeChecker,
		  oneOf: createEnumTypeChecker,
		  oneOfType: createUnionTypeChecker,
		  shape: createShapeTypeChecker
		};

	/***/ },
	/* 2 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

		/**
		 * Copyright 2013-2015, Facebook, Inc.
		 * All rights reserved.
		 *
		 * This source code is licensed under the BSD-style license found in the
		 * LICENSE file in the root directory of this source tree. An additional grant
		 * of patent rights can be found in the PATENTS file in the same directory.
		 *
		 */

		var invariant = _interopRequire(__webpack_require__(5));

		var warning = _interopRequire(__webpack_require__(4));

		var loggedTypeFailures = {};

		var validate = function (propTypes, props, className) {
		  for (var propName in propTypes) {
		    if (propTypes.hasOwnProperty(propName)) {
		      var error;
		      // Prop type validation may throw. In case they do, we don't want to
		      // fail the render phase where it didn't fail before. So we log it.
		      // After these have been cleaned up, we'll let them throw.
		      try {
		        // This is intentionally an invariant that gets caught. It's the same
		        // behavior as without this statement except with a better message.
		        invariant(typeof propTypes[propName] === "function", "%s: %s type `%s` is invalid; it must be a function, usually from " + "PropTypes.", className, "attributes", propName);

		        error = propTypes[propName](props, propName, className, "prop");
		      } catch (ex) {
		        error = ex;
		      }
		      if (error instanceof Error && !(error.message in loggedTypeFailures)) {
		        // Only monitor this failure once because there tends to be a lot of the
		        // same error.
		        loggedTypeFailures[error.message] = true;
		        warning(false, "Failed propType: " + error.message);
		      }
		    }
		  }
		};

		module.exports = validate;

	/***/ },
	/* 3 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

		/**
		 * Copyright 2013-2015, Facebook, Inc.
		 * All rights reserved.
		 *
		 * This source code is licensed under the BSD-style license found in the
		 * LICENSE file in the root directory of this source tree. An additional grant
		 * of patent rights can be found in the PATENTS file in the same directory.
		 *
		 */

		var invariant = _interopRequire(__webpack_require__(5));

		var validateWithErrors = function (propTypes, props, className) {
		  for (var propName in propTypes) {
		    if (propTypes.hasOwnProperty(propName)) {
		      var error;
		      // Prop type validation may throw. In case they do, we don't want to
		      // fail the render phase where it didn't fail before. So we log it.
		      // After these have been cleaned up, we'll let them throw.
		      try {
		        // This is intentionally an invariant that gets caught. It's the same
		        // behavior as without this statement except with a better message.
		        invariant(typeof propTypes[propName] === "function", "%s: %s type `%s` is invalid; it must be a function, usually from " + "PropTypes.", className, "attributes", propName);

		        error = propTypes[propName](props, propName, className, "prop");
		      } catch (ex) {
		        error = ex;
		      }
		      // rethrow the error
		      if (error instanceof Error) {
		        throw error;
		      }
		    }
		  }
		};

		module.exports = validateWithErrors;

	/***/ },
	/* 4 */
	/***/ function(module, exports, __webpack_require__) {

		"use strict";

		/**
		 * Copyright 2014-2015, Facebook, Inc.
		 * All rights reserved.
		 *
		 * This source code is licensed under the BSD-style license found in the
		 * LICENSE file in the root directory of this source tree. An additional grant
		 * of patent rights can be found in the PATENTS file in the same directory.
		 *
		 */

		var warning = function (condition, format) {
		  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
		    args[_key - 2] = arguments[_key];
		  }

		  if (format === undefined) {
		    throw new Error("`warning(condition, format, ...args)` requires a warning " + "message argument");
		  }

		  if (format.length < 10 || /^[s\W]*$/.test(format)) {
		    throw new Error("The warning format should be able to uniquely identify this " + "warning. Please, use a more descriptive format than: " + format);
		  }

		  if (!condition) {
		    var argIndex = 0;
		    var message = "Warning: " + format.replace(/%s/g, function () {
		      return args[argIndex++];
		    });
		    console.warn(message);
		    try {
		      // This error was thrown as a convenience so that you can use this stack
		      // to find the callsite that caused this warning to fire.
		      throw new Error(message);
		    } catch (x) {}
		  }
		};

		module.exports = warning;

	/***/ },
	/* 5 */
	/***/ function(module, exports, __webpack_require__) {

		/**
		 * BSD License
		 *
		 * For Flux software
		 *
		 * Copyright (c) 2014, Facebook, Inc. All rights reserved.
		 *
		 * Redistribution and use in source and binary forms, with or without modification,
		 * are permitted provided that the following conditions are met:
		 *
		 *  * Redistributions of source code must retain the above copyright notice, this
		 *    list of conditions and the following disclaimer.
		 *
		 *  * Redistributions in binary form must reproduce the above copyright notice,
		 *    this list of conditions and the following disclaimer in the
		 *    documentation and/or other materials provided with the distribution.
		 *
		 *  * Neither the name Facebook nor the names of its contributors may be used to
		 *    endorse or promote products derived from this software without specific
		 *    prior written permission.
		 *
		 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
		 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
		 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
		 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
		 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
		 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
		 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
		 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
		 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
		 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
		 *
		 */

		"use strict";

		/**
		 * Use invariant() to assert state which your program assumes to be true.
		 *
		 * Provide sprintf-style format (only %s is supported) and arguments
		 * to provide information about what broke and what you were
		 * expecting.
		 *
		 * The invariant message will be stripped in production, but the invariant
		 * will remain to ensure logic does not differ in production.
		 */

		var invariant = function (condition, format, a, b, c, d, e, f) {
		  // if (process.env.NODE_ENV !== 'production') {
		  //   if (format === undefined) {
		  //     throw new Error('invariant requires an error message argument');
		  //   }
		  // }

		  if (!condition) {
		    var error;
		    if (format === undefined) {
		      error = new Error("Minified exception occurred; use the non-minified dev environment " + "for the full error message and additional helpful warnings.");
		    } else {
		      var args = [a, b, c, d, e, f];
		      var argIndex = 0;
		      error = new Error("Invariant Violation: " + format.replace(/%s/g, function () {
		        return args[argIndex++];
		      }));
		    }

		    error.framesToPop = 1; // we don't care about invariant's own frame
		    throw error;
		  }
		};

		module.exports = invariant;

	/***/ }
	/******/ ]);

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	module.exports = require("@google-cloud/storage");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	module.exports = require("path");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.pick = pick;
	// eslint-disable-next-line import/prefer-default-export
	function pick(object, paths) {
	  var obj = {};
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;

	  try {
	    for (var _iterator = paths[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var path = _step.value;

	      if (object[path]) {
	        obj[path] = object[path];
	      }
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator.return) {
	        _iterator.return();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }

	  return obj;
	}

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	module.exports = require("recursive-readdir");

/***/ })
/******/ ])
});
;
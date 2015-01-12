# MongoAdapter With Embedded document support

Waterline adapter for MongoDB. Forked from https://github.com/balderdashy/sails-mongo

Supports Embedded documents in MongoDB. For other details, see the original sails-mongo.

As per the [Feature Request](https://github.com/balderdashy/sails-mongo/issues/44), to implement Embedded documents, the direction 
seems to be to implement them in waterline2. It also discourages the use of "embedded" as true. This adapter implements embedded documents 
with "embedded: true", until then. 

## Approach

The Models are kept separate, as is the current case. Obviously, only One Way Association and One-to-Many associations are supported.

The user specifies "embed" property along with the "model" property, in the associatING model. In the associated model, an "embedded" 
property (not an attribute) is specified to indicate that this model does NOT directly store the data. Other adapters are expected to 
ignore these two properties.

Consequently, the insert, update and find are achieved ONLY in the associatING model ("parent"), where the attributes of the associatED
model ("embedded") are passed by way of "&lt;childModelName&gt;.&lt;attribute&gt;" - something similar to MongoDB support.

As an additional bonus, if parameters are passed in the format "&lt;childModelName&gt;.&lt;attribute&gt;" for insert and update -- even 
for non-embedded documents -- this adapter automatically handles, which is a very useful quirk. See the details, on how to do this.

## Changes from sails-mongo

### Models (One Way Association)

myApp/api/models/pet.js

```javascript
module.exports = {
	
	attributes: {
		name: 'STRING',
		color: 'STRING'
	},
	embedded: true
}
```

myApp/api/models/user.js

```javascript
module.exports = {
	
	attributes: {
		name: 'STRING',
		age: 'INTEGER',
		pony: {
			model: 'pet',
			embed: true
		}
	}
}
```

### Access (One Way Association)

```javascript




## Installation (TBD)

Install from NPM.

```bash
$ npm install sails-mongo-embedded --save
```

## Sails Configuration

Add the mongo config to the `config/adapters.js` file.

## Sails.js

http://sailsjs.org

## Waterline

[Waterline](https://github.com/balderdashy/waterline) is a brand new kind of storage and retrieval engine.

It provides a uniform API for accessing stuff from different kinds of databases, protocols, and 3rd party APIs. That means you write the same code to get users, whether they live in MySQL, LDAP, MongoDB, or Facebook.


## Contributors

Thanks so much to Ted Kulp ([@tedkulp](https://twitter.com/tedkulp)) and Robin Persson ([@prssn](https://twitter.com/prssn)) for building this adapter.


## Sails.js License

### The MIT License (MIT)

Copyright © 2012-2013 Mike McNeil

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/a22d3919de208c90c898986619efaa85 "githalytics.com")](http://githalytics.com/mikermcneil/sails-mongo)

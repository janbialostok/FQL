// Place your code here:

// Adds properties of obj2 into obj1
function merge(obj1, obj2) {
	var obj3 = {};
	for (var key in obj1){
		if (obj1.hasOwnProperty(key)){
			obj3[key] = obj1[key];
		}
	}
	for (var key in obj2){
		if (obj2.hasOwnProperty(key)){
			obj3[key] = obj2[key];
		}
	}
	return obj3;
}


var FQL = function(table) {
	this.movies = table;
};

FQL.prototype.exec = function () {
	return this.movies;
};
//Original where method
// FQL.prototype.where = function (filters) {
// 	var temp = [];
// 	var keys = Object.keys(filters);
// 	 for (var i = 0; i < this.movies.length; i++){
// 		 var shouldPush = false;
// 		 var totalKeys = keys.length;
// 		 while (totalKeys--){
// 		  	var currValue = this.movies[i][keys[totalKeys]];
// 		 	if (typeof filters[keys[totalKeys]] == "function") {
// 		 		shouldPush = filters[keys[totalKeys]](currValue);
// 		 	} else if (currValue == filters[keys[totalKeys]]) {
// 		 		shouldPush = true;
// 		 	}
// 		 }
// 		 if (shouldPush){
// 		 	temp.push(this.movies[i]);
// 		 }
// 	 }
// 	 return new FQL(temp);
// };
//Revised where method
FQL.prototype.where = function (filters) {
	// for ever key/value pair
	// filter out non-matches
	// values may be functions or primitives
	// functions should be called on each row value
	var newTable = this.exec();
	for (var colName in filters) {
		var valOrFn = filters[colName]
		if (valOrFn instanceof Function) {
			newTable = newTable.filter(function (row) {
				return valOrFn(row[colName]);
			});
		} else {
			newTable = newTable.filter(function (row) {
				return valOrFn == row[colName];
			});
		}
	}
	return new FQL(newTable);
};

FQL.prototype.count = function () {
	return this.movies.length;
};

FQL.prototype.limit = function (amount) {
	var table = this.movies;
	var newTable = table.slice(0, amount);
	this.movies = newTable;
	return this;
};

//Original select and order methods
// FQL.prototype.select = function (columnNames) {
// 	var temp = []
// 	for (var i = 0; i < this.movies.length; i++) {
// 		var tempObj = {};
// 		for (var j = 0; j < columnNames.length; j++) {
// 			tempObj[columnNames[j]] = this.movies[i][columnNames[j]];
// 		}
// 		//console.log(tempObj);
// 		temp.push(tempObj);
// 	}
// 	this.movies = temp;
// 	return this;
// };

// FQL.prototype.nimit = function () {
// };

// FQL.prototype.order = function (columnName) {
// 	this.movies.sort(function (a, b) {
// 	  if (a[columnName] > b[columnName]) {
// 	    return 1;
// 	  }
// 	  if (a[columnName] < b[columnName]) {
// 	    return -1;
// 	  }
// 	  // a must be equal to b
// 	  return 0;
// 	});	
// 	return this;
// };

//Revised select and order methods
FQL.prototype.select = function (columnNames) {
	var newTable = this.exec().map(function (row) {
		var newRow = {};
		columnNames.forEach(function (colName) {
			newRow[colName] = row[colName];
		});
		return newRow;
	});
	return new FQL(newTable);
};

FQL.prototype.order = function (columnName) {
	// a lot like sorting
	var newTable = this.exec().sort(function (currRow, nextRow) {
		return currRow[columnName] - nextRow[columnName];
	});
	return new FQL(newTable);
};

FQL.prototype.left_join = function (foreignFql, rowMatcher) {
	var newTable = [];

	var currentTable = this.movies;
	foreignFql.movies.forEach(function(role){
		currentTable.forEach(function(movie){
			if (rowMatcher(movie, role)){
				newTable.push(merge(movie, role));
			}
		});
	});
	return new FQL(newTable);
};




FQL.prototype.addIndex = function (columnName) {
	var newIndex = this.exec().map(function(row){
		var newRow = {};
		newRow[columnName] = row[columnName]
		return newRow;
	});
	for (var i = 0; i < newIndex.length; i++){
		newIndex[i].index = i;
	}
	this["index " + columnName] = newIndex;
};

FQL.prototype.getIndicesOf = function (columnName, val) {
	var indices = [];
	if (typeof this["index " + columnName] == "undefined"){
		return undefined;
	}
	else{
		for (var i = 0; i < this["index " + columnName].length; i++){
			if (val == this["index " + columnName][i][columnName]){
				indices.push(i);
			}
		}
		console.log(indices);
		return indices;
	}
};

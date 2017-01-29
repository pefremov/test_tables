modulesList.push("showTables");

angular.module('showTables', []);

angular.module('showTables').component('showTables', {
	templateUrl: 'templates/showTables.html',
	controller: ["youtube", "$scope", function(youtube, $scope) {
		var self = this;
		var isAscend = false;
		this.table = false;
		
		if(this.search) {
			youtube.getTestQuery( this.search, this, "table" );
		} else {
			this.table = "no search query provided";
		}
		
		this.sortByColumn = "title";
		
		this.filters = {
			videoID: "",
			title: "",
			channel: "",
			desc: ""
		}
		
		this.show = {
			title: true,
			channel: true,
			description: true
		}
		
		this.sortableOptions = {
			placeholder: "app",
			connectWith: ".apps-container",
			handle: ".handle",
			helper: "clone",
			receive: function(event, ui) {
				self.sortableOptions.receivedNew = true;
			},
			update: function(event, ui) {
				if(self.sortableOptions.receivedNew == true) {
					receiveFix(event, ui);
					self.filterTable();
				}
				self.sortableOptions.receivedNew = false;
			},
			remove: function(event, ui) {
				if(self.fullTable) {
					let eidolon = JSON.parse(ui.item[0].dataset.eidolon);
					
					for(let i = 0; i < self.fullTable.length; i++) {
						
						if(self.fullTable[i].videoID == eidolon.videoID) {
							self.fullTable.splice(i, 1);
							
							break;
						}
					}
					
					console.log(eidolon);
				}
				
				
			}
		};
		
		//workaround sollution for items moving between tables
		//should look at alternatives to angular-ui sortable as there seems to be some nasty bugs right now
		let receiveFix = function(event, ui) {
			if(!self.fullTable) {
				//forming new real full table (wihout hidden elements)
				self.fullTable = self.table.slice(0);
			} else {
				let eidolon = JSON.parse(ui.item[0].dataset.eidolon);
				self.fullTable.push(eidolon);
			}
		}
		
		let _sortTable = function(a, b) {
			let AB = a[self.sortByColumn] > b[self.sortByColumn];
			let	BA = a[self.sortByColumn] < b[self.sortByColumn];
			
			if(isAscend) {
				AB = !AB;
				BA = !BA;
			}
			
			if(AB) return 1;
			else if(BA) return -1;
			return 0;
		}
		
		//initial table sorting
		if(this.table) {
			this.table.sort(_sortTable);
		}
		
		//sort method update on headers click
		//in order to control ordering flow, rather than using angular automatic one
		this.sortBy = function(column, t) {
			const symbol_up = "↑";
			const symbol_down = "↓";
			const reg_clear = /[↑↓]/g;
			isAscend = false;

			t = t.currentTarget;
			
			if(t.textContent.indexOf(symbol_down) != -1) {
				isAscend = true;
			}

			let headers = t.parentNode.getElementsByClassName("row_head");
			for(let i in headers) {
				if(headers[i].textContent) {
					headers[i].textContent = headers[i].textContent.replace(reg_clear, "");
				}
			}
			
			if(isAscend) {
				t.textContent += " " + symbol_up;
				this.sortByColumn = "-" + column;
			} else {
				t.textContent += " " + symbol_down;
				this.sortByColumn = column;
			}
			
			this.table.sort(_sortTable);

		}
		
		this.fullTable = false;
		
		//table column filtering
		//workaround for angular-ui sortable problems
		this.filterTable = function() {
			let hide = false;
			let target;
			let pattern;
			
			if(!self.fullTable) {
				//forming new real full table (wihout hidden elements)
				self.fullTable = self.table.slice(0);
			}
			
			self.table = self.fullTable.slice(0);
			
			for(var i = 0; i < self.table.length; i++) {
				hide = false;
				
				for(let j in self.filters) {
					if(!self.table[i][j]) {
						self.table[i][j] = " ";
					}
					target = self.table[i][j].toLowerCase();
					pattern = self.filters[j].toLowerCase();
					
					if(target.indexOf( pattern ) == -1) {
						hide = true;
					}
				}
				
				if(hide) {
					self.table.splice(i, 1);
					i--;
				}
			}
			
			self.table.sort(_sortTable);
		}
		
		//table export function
		this.exportTable = function($event) {
			let table = self.fullTable ? self.fullTable : self.table;
			let exportData = JSON.stringify(table);
			
			let a = $event.currentTarget.parentNode.getElementsByClassName("export_link")[0];
			let file = new Blob([exportData], {type: "text/plain"});
			a.href = URL.createObjectURL(file);
			a.download = "export.json";
			a.style.display = "inline";
		}

	}],
	bindings: {
		search: '@'
	}
});
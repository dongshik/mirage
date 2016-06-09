import { Component, OnInit, OnChanges, SimpleChange } from "@angular/core";
import { NgForm } from "@angular/common";
import { BuildComponent } from "./build/build.component";
import { ResultComponent } from "./result/result.component";
import { RunComponent } from "./run/run.component";
import { SaveQueryComponent } from './features/save/save.query.component';
import { ListQueryComponent } from './features/list/list.query.component';
import { Config } from "./shared/config";
import { editorHook } from "./shared/editorHook";
import { AppbaseService } from "./shared/appbase.service";
import { prettyTime } from "./shared/pipes/prettyTime";

@Component({
	selector: 'my-app',
	templateUrl: './app/app.component.html',
	directives: [BuildComponent, ResultComponent, RunComponent, SaveQueryComponent, ListQueryComponent],
	providers: [AppbaseService],
	pipes: [prettyTime]
})

export class AppComponent implements OnInit, OnChanges {

	constructor(public appbaseService: AppbaseService) {}

	public connected: boolean = false;
	public initial_connect: boolean = false;
	public mapping: any = {
		types: [],
		mapping: null,
		resultQuery: {
			'type': '',
			'result': [],
			'final': "{}"
		},
		output: {},
		queryId: 1
	};
	public detectChange: string = null;
	public config: Config = {
		url: "",
		appname: "",
		username: "",
		password: ""
	};
	public editorHookHelp = new editorHook({ editorId: 'editor' });
	public responseHookHelp = new editorHook({ editorId: 'responseBlock' });
	public savedQueryList = [];
	public query_info = {
		name: '',
		tag: ''
	};

	ngOnInit() {
		this.getLocalConfig();
		try {
			let list = window.localStorage.getItem('queryList');
			if(list) {
				this.savedQueryList = JSON.parse(list);
				console.log(this.savedQueryList);
			}
		} catch(e) {}
	}

	ngOnChanges(changes) {
		var prev = changes['selectedQuery'].previousValue;
		var current = changes['selectedQuery'].currentValue;
	}

	//Get config from localstorage 
	getLocalConfig() {
		var url = window.localStorage.getItem('url');
		var appname = window.localStorage.getItem('appname');
		if (url != null) {
			this.config.url = url;
			this.config.appname = appname;
			this.connect();
		}
		else {
			this.initial_connect = true;
		}
	}

	//Set config from localstorage
	setLocalConfig(url, appname) {
		window.localStorage.setItem('url', url);
		window.localStorage.setItem('appname', appname);
	}

	// Connect with config url and appname
	// do mapping request  
	// and set response in mapping property 
	connect() {
		this.connected = false;
		this.initial_connect = false;
		var APPNAME = this.config.appname;
		var URL = this.config.url;
		var urlsplit = URL.split(':');
		var pwsplit = urlsplit[2].split('@');
		this.config.username = urlsplit[1].replace('//', '');
		this.config.password = pwsplit[0];
		var self = this;
		this.appbaseService.setAppbase(this.config);
		this.appbaseService.get('/_mapping').then(function(res) {
			self.connected = true;
			let data = res.json();
			self.mapping = {
				types: [],
				mapping: null,
				resultQuery: {
					'type': '',
					'result': [],
					'final': "{}"
				},
				output: {},
				queryId: 1
			};
			self.mapping.mapping = data;
			self.mapping.types = self.seprateType(data);
			self.setLocalConfig(self.config.url, self.config.appname);
			self.detectChange += "done";
			self.editorHookHelp.setValue('');
		}).catch(function(e) {
			self.initial_connect = true;
			alert(e.json().message);
		});
	}

	// Seprate the types from mapping	
	seprateType(mappingObj) {
		var mapObj = mappingObj[this.config.appname].mappings;
		var types = [];
		for (var type in mapObj) {
			types.push(type);
		}
		return types;
	}

	newQuery(query) {
		this.config = query.config;
		this.mapping = query.mapping;
		console.log(this.mapping);
		this.query_info.name = query.name;
		this.query_info.tag = query.tag;
		this.detectChange = "check";
		setTimeout(() => {$('#setType').val(this.mapping.selectedTypes).trigger("change");},300)
	}

	deleteQuery(index) {
		var confirmFlag = confirm("Do you want to delete this query?");
		if(confirmFlag) {
			this.savedQueryList.splice(index, 1);
			try {
				window.localStorage.setItem('queryList', JSON.stringify(this.savedQueryList));
			} catch(e) {}
		}
	}

	clearAll() {
		this.mapping = {
			types: this.mapping.types,
			resultQuery: {
				'type': '',
				'result': [],
				'final': "{}"
			},
			output: {},
			queryId: 1,
			selectedTypes: []
		};
		this.query_info = {
			name: '',
			tag: ''
		};	
		this.detectChange += "check";
		this.editorHookHelp.setValue('');
	}

	sidebarToggle() {
		if($('.feature-query-container').hasClass('off')) {
			$('.feature-query-container').removeClass('off');
		}
		else {
			$('.feature-query-container').addClass('off');
		}
	}

}



export default class FolderService {

    constructor($http, config) {
        this.$http = $http;
        this.config = config;
        this.allFoldersEndpoint = `${this.config.API_URL}folders`; //use service catalog to get this link
    }

    cleanUrlx (url) {
        //temp TODO - until CORS is up proxying through the bundled server
        if(this.config.API_URL === "/") {
            var a = document.createElement('a');
            a.href = url;
            return url.replace(a.host, window.location.host);
        }
    }

    fetchRootFolder() {
        var rootFolderFilter ="parentFolder is null";
        var filter = "?filter=" + rootFolderFilter;
        var url = this.allFoldersEndpoint + filter;

        var httpPromise = this.$http.get(url);
        return this.$http.get(url).then( response => {
            return response.data._embedded ? response.data._embedded.itemResourceList : [];
        })
    }

    //split this up to make it more readable for MMTM clients
    fetchContent(folder: Object = {}, user: Object = {}) {
        var url;
        if (folder._links && folder._links.items) {
            url = folder._links.items.href;
            url = this.cleanUrlx(url);
        } else {
            url = `${this.config.API_URL}folders`;
        }
        if(user && user.email) {
          var ownerFilter = "owner = '"+user.email+"'";
          var filter =  "?filter=" + ownerFilter;
          url += filter;
        }
        return this.$http.get(url).then( response => {
            return response.data._embedded ? response.data._embedded.itemResourceList : [];
        })
    }

    addItem(folder: Object, item: Object) {
        var url;
        if (folder._links && folder._links.items) {
            url = folder._links.items.href;
            url = this.cleanUrlx(url);
        }

        if(!url) {
            return;
            //log error
        }

        return this.$http.post(url, item).then(response => {
            return response.data;
        })

    }

    createFolderAtRoot(folder: Object) {
        folder.parentFolder = 0;//ensuring that it's created at the root folder
        var url = this.allFoldersEndpoint;
        return this.$http.post(url, folder).then(response => {
            return response.data;
        })
    }
}

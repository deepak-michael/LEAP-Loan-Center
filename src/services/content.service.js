

export default class ContentService {

    constructor($http, config) {
        this.$http = $http;
        this.config = config;
        this.allContentEndpoint = `${this.config.API_URL}files`;
    }

    cleanUrlx (url) {
        //temp TODO - until CORS is up proxying through the bundled server
        if(this.config.API_URL === "/") {
            var a = document.createElement('a');
            a.href = url;
            var urlMod = url.replace(a.protocol, window.location.protocol);
            return urlMod.replace(a.host, window.location.host);
        }
    }

    uploadFile(files) {
        var url = `${this.config.API_URL}content`;
        var subscriptionParam = "?subscription="+this.config.SUBSCRIPTION_NAME;
        url = url + subscriptionParam;
        var fd = new FormData();
        fd.append("file", files[0]);
        console.log("blob api url " + url);
        return this.$http.post(url, fd, {
            headers : {
                'Content-Type' : undefined
            },
            transformRequest : function(data, headersGetterFunction) {
                //Angular will POST as JSON even if you set the Content-Type to the correct value multipart/form-data.
                // So we must transform our request manually to the correct data
                return data; // do nothing! FormData is very good!
            }
        }).then(response => {
            return response.data.entries;
        });
    }

    fetchLoanDocuments(user: Object = {}) {
        var loanContentFilter ="traits.loan.loanAmount is not null";
        var filter = "filter=" + loanContentFilter;
        if(user && user.email) {
          var ownerFilter = "owner %3D '"+user.email+"'";
          filter +=  " and " + ownerFilter;
        }
        var url = this.allContentEndpoint + "?" + filter;

        return this.$http.get(url).then( response => {
            return response.data._embedded ? response.data._embedded.collection : [];
        })

    }

}

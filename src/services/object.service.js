

export default class ObjectService {

    constructor($http, config, $q) {
      this.$http = $http;
      this.config = config;
      this.$q = $q;
      this.deferred = $q.defer ();
    }

    cleanUrlx (url) {
      //temp TODO - until CORS is up proxying through the bundled server
      if(this.config.API_URL === "/") {
        var a = document.createElement('a');
        a.href = url;
        return url.replace(a.host, window.location.host);
      }
    }

    /**
     * Gets the self link for the object from the REST resource for the object
     * Call PUT on the same with the complete object in the PUT data
     * @param object
     * @returns {*}
     */
    updateObject(object: Object = {}) {
      var url;
      if(object._links && object._links.self){
        url = object._links.self.href;
        url = this.cleanUrlx(url);
      }

      return this.$http.put(url, object).then(response => {
        return response.data;
      });
    }

    patchObject(object: Object, patch: Object) {
      var url;

      if(object._links && object._links.self){
        url = object._links.self.href;
        url = this.cleanUrlx(url);
      }

      return this.$http.patch(url, patch).then( response => {
        return response.data;
      })
    }

    updateObjectEx(object: Object) {
      var url;

      if(object._links && object._links.self){
        url = object._links.self.href;
        url = this.cleanUrlx(url);
      }

      return this.$http.put(url, object).then( response => {
        return response.data;
      })
    }

    fetchObjectPermissionInfo(object: Object) {
      var url;
      var acl = object.acl;
      var permissionsEndpoint = `${this.config.API_URL}permissions/`;

      if (acl) {
        url = permissionsEndpoint + acl;
        return this.$http.get(url).then(response => {
          return response.data;
        })
      }
      else {
        this.$q.resolve({});
      }
    }

    fetchPermission(aclname: string) {
      var url;
      var permissionsEndpoint = `${this.config.API_URL}permissions`;

      var filter = "?name=" + aclname;
      url = permissionsEndpoint + filter;
      return this.$http.get(url).then(response => {
        return response.data;
      })
    }

    createPermissions(object: Object) {
        var permissionsEndpoint = `${this.config.API_URL}permissions`;

        return this.$http.post(permissionsEndpoint, object).then(response => {
                    return response.data;
        }).catch (function (msg, code) {
            //this.deferred.reject();
        });
    }

    createTraitDefinitions(object: Object) {
        var traitDefinitionsEndpoint = `${this.config.API_URL}trait-definitions`;

        return this.$http.post(traitDefinitionsEndpoint, object).then(response => {
                return response.data;
    }).catch (function (msg, code) {
            //this.deferred.reject();
        });
    }
}

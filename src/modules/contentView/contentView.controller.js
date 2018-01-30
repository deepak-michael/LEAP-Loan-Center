
export default class ContentViewController {
    constructor (content, ObjectService, $mdDialog, $http){
        this.newContent = content;
        this.objectService = ObjectService;
        this.loanFile = Array.isArray(content.renditions) ? content.renditions[0] : {};
        this.downloadUrl2 = content._links && content._links["urn:eim:linkrel:download-media"] ? content._links["urn:eim:linkrel:download-media"].href : '';
        this.loanTrait = content.traits && content.traits.loan ? content.traits.loan.loan : {};
        this.dialog = $mdDialog;
        this.$http = $http;
    }

    closeDialog() {
        this.dialog.hide();
    }

    downloadFile() {
        if (this.loanFile) {
            var downloadUrl = this.cleanUrlx(this.loanFile.downloadUrl);
            downloadUrl = downloadUrl ? downloadUrl : this.cleanUrlx(this.downloadUrl2);
            this.$http.get(downloadUrl).then((data) => {
                var file = new Blob([data.data], {type: this.loanFile.mimeType});
                var anchor = angular.element('<a/>');
                var url = window.URL || window.webkitURL;
                anchor.attr({
                    //href: 'data:' + this.loanFile.mimeType + ',' + encodeURI(data),
                    href: url.createObjectURL(file),
                    target: '_blank',
                    download: this.loanFile.name
                })[0].click();
            })
        }
    }

    cleanUrlx (url) {
        url = url ? url.replace("httpss", "https") : "";
        //temp TODO - until CORS is up proxying through the bundled server
        if(this.objectService.config.API_URL === "/") {
            var a = document.createElement('a');
            a.href = url;
            var urlMod = url.replace(a.protocol, window.location.protocol);
            return urlMod.replace(a.host, window.location.host);
        }
        return url;
    }
}
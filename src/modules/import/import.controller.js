
export default class ImportController {
    constructor (folder, ContentService, FolderService, ObjectService, $mdDialog){
        this.folder = folder;
        this.contentService = ContentService;
        this.folderService = FolderService;
        this.objectService = ObjectService;
        this.fileName = "Choose file";

        this.dialog = $mdDialog;
        this.newContent = {
            name : '',
            description : '',
            type: 'file', //setting this to object until Blob service issue is resolved
            acl: '',
            "versionLabel": [
                "INITIAL"
            ],
            "traits": {},
            "renditions": []
        };
        this.loanTrait = { };
        this.versionDescription = "Primary version";
        this.renditionType = "PRIMARY";
        //find out the acl id for applied loans
        this.objectService.fetchPermission('loanApplication').then(aclObject => {
                if (aclObject) {
                    this.loanApplicationAcl = aclObject;
                    this.newContent.acl = aclObject.id;
                }
            }
        );

    }

    cancel() {
      this.dialog.hide();
    }

    saveContent() {
        if (this.contentFiles) {
            console.log(this.newContent);
            console.log(this.loanTrait);
            this.applyLoanTraitToContent();

            this.contentService.uploadFile(this.contentFiles)
                .then((items) => {
                    if (Array.isArray(items) && items.length == 1) {
                        var blobContent = items[0];
                        this.updateNewContentWithBlobInfo(blobContent);
                        this.folderService.addItem(this.folder, this.newContent).
                        then((item) => {
                                this.dialog.hide(true, item);
                            }
                        ).catch((error) => {
                            if(error.status == 400) {
                                this.serverError = error.data.details;
                                this.serverErrorsPresent = true;
                            }
                        })
                    }
                })
                .catch((error) => {
                    //This is a backup for development purposes only
                    if (error.status == 401) {
                        this.newContent.type = "object";
                        delete this.newContent.renditions;
                        this.folderService.addItem(this.folder, this.newContent).
                        then((item) => {
                            this.dialog.hide(true, item);
                        }
                        ).catch((error) => {
                            if(error.status == 400) {
                                this.serverError = error.data.details;
                                this.serverErrorsPresent = true;
                            }
                        })

                    }
                })
                .finally(() => {
                    //this.loading = false;
                })
        }
    }

    clickUpload() {
        //ugly hack for masking the ugly input button
        setTimeout(function () {
            var inputElem = document.getElementById('fileInput');
            if(inputElem) {
                inputElem.click();
            }
        }, 0);
    }

    fileChanged (element) {
        var files = element.files;
        if (files[0]) {
            this.fileName = files[0].name;
            this.contentFiles = files;
        } else {
            this.fileName = null;
        }
    }

    updateNewContentWithBlobInfo(blobContent) {
        this.newContent.renditions = [];
        this.newContent.renditions.push({
            "name": this.fileName,
            "mimeType": blobContent.content.properties.contentType, //like "application/pdf" : take this from blob response
            "contentSize": blobContent.content.properties.size,   // like 49685: content size coming from the previous blob response
            "blobId": blobContent.id,  // comes from the previous blob response of upload and the field "uri"
            "renditionType": this.renditionType
        });
    }

    applyLoanTraitToContent() {
        this.newContent.traits.loan = {
            "loan" : this.loanTrait
        }
    }
}

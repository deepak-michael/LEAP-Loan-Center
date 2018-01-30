
export default class ContentEditController {
  constructor (content, ObjectService, $mdDialog, UserService, _profileData, $http, LoggerService){
    this.content = content;
    this.loanTrait = content.traits && content.traits.loan ? content.traits.loan.loan : {};
    this.objectService = ObjectService;
    this.loggerService = LoggerService;

    this.loanStatus = content.traits && content.traits.loanreviewstatus && content.traits.loanreviewstatus.statustrait ? content.traits.loanreviewstatus.statustrait : {};
    this.userProfile = _profileData;
    this.loanFile = content.renditions? content.renditions.find(function(rendition) {
      return rendition.renditionType == "PRIMARY";
    }) : {};
    this.isLoanOfficer = false;
    this.displayHeader = "Edit Loan Application";
    this.mainTabLabel = content.traits && content.traits.loan ? "Loan document" : "Document";
    if(this.content.type == 'folder') {
      this.displayHeader = "Edit folder";
      this.mainTabLabel = "Folder";
    }
    this.userRoles = UserService.getRoles(false);

    this.userCanEditDocument = false;
    this.displayApprovalTab = this.loanStatus.id != null;

    var roles = this.userRoles;
    if (Array.isArray(roles) && roles.includes("loan_officer")) {
      this.isLoanOfficer = true;
        this.displayHeader = "Review Loan Application";
      //get loan approval acl that is to be updated when loan officer approves
      this.objectService.fetchPermission('loanApproved').then(aclObject => {
            this.loanApprovalAcl = aclObject;
          }
      );
    }


    if(!this.loanStatus.id) {
      var roles = this.userRoles;
      if (this.isLoanOfficer && this.content.type == 'file') {
        this.displayHeader = "Review loan document";
        this.displayApprovalTab = true;
        this.loanStatus = {
          reviewer: this.userProfile.email,
          isApproved: false,
          /*reviewDate: (new Date()).toISOString(),*/
          remarks: ""
        };

      }

      //retrieve acl for the current document
      ObjectService.fetchObjectPermissionInfo(this.content).then(permission => {
        this.documentAcl = permission;
        var applicableDocRoles = this.documentAcl.roles.filter(role => {
          return this.userRoles.includes(role.name);
        });

        var permitFound = applicableDocRoles.find(role => {
          return role.permits && role.permits.includes('write')
        });
        if (permitFound) {
          this.userCanEditDocument = true;
        }

      });
    }
    //if user has readonly access then make the view readonly

    this.dialog = $mdDialog;
    this.$http = $http;
  }

  cancel() {
    this.dialog.hide();
  }

  saveContent() {
    if(this.isLoanOfficer && this.content.type == 'file'){
        this.applyLoanStatusTraitToContent();
        if (this.loanApprovalAcl) {
            this.content.acl = this.loanApprovalAcl.id;
            this.objectService.updateObjectEx(this.content).then(data => {
                this.loggerService.showToast("Document reviewed");
                this.dialog.hide();
            })
            .catch((error) => {
                if(error.status == 400) {
                    this.serverError = error.data.details;
                    this.serverErrorsPresent = true;
                }
            })
        }
        else{
            this.loggerService.showToast("Document acl was not updated to loan approved acl as permission object wsa nto fetched");
            this.dialog.hide();
        }
    }
    else{
        this.objectService.updateObject(this.content).then(data => {
            this.loggerService.showToast("Update successful");
            this.dialog.hide();
        })
            .catch((error) => {
                if(error.status == 400) {
                    this.serverError = error.data.details;
                    this.serverErrorsPresent = true;
                }
            });
    }
    }

  saveContentEx() {
    if(this.isLoanOfficer && this.content.type == 'file'){
      //this.applyLoanStatusTraitToContent();
      //Use Object service to patch object with traits
      this.objectService.patchObject(this.content, this.getLoanStatusTraitToPatch()).then((data) => {
        this.loggerService.showToast("Loan Status updated");
        //udpate acl
        var content = data;
        if (this.loanApprovalAcl) {
          content.acl = this.loanApprovalAcl.id;
          this.objectService.updateObjectEx(content).then(data => {
            this.loggerService.showToast("Document acl updated to loan approved acl");
            this.dialog.hide();
          })
          .catch((error) => {
              if(error.status == 400) {
                  this.serverError = error.data.details;
                  this.serverErrorsPresent = true;
              }
          })
        }
        else{
          this.loggerService.showToast("Document acl was not updated to loan approved acl as permission object wsa nto fetched");
          this.dialog.hide();
        }
      })
      //or use PUT to update the whole object
      /*this.applyLoanStatusTraitToContent();
      this.objectService.updateObjectEx(this.content).then((data) => {
        this.loggerService.showToast("Loan Status updated");
        this.dialog.hide();
      })*/

    }
    else{
      this.objectService.updateObject(this.content).then(data => {
        this.loggerService.showToast("Update successful");
        this.dialog.hide();
      })
      .catch((error) => {
          if(error.status == 400) {
              this.serverError = error.data.details;
              this.serverErrorsPresent = true;
          }
      });
    }
  }

  applyLoanStatusTraitToContent() {
    //this.loanStatus.reviewDate = (new Date()).toISOString();
    this.content.traits.loanreviewstatus = {
      statustrait : this.loanStatus
    }
  }

  getLoanStatusTraitToPatch() {
    //this.loanStatus.reviewDate = (new Date()).toISOString();
    return {
      traits: {
        loanreviewstatus: {
          statustrait: this.loanStatus
        }
      }
    }
  }

  downloadFile() {
    if (this.loanFile) {
      var downloadUrl = this.cleanUrlx(this.loanFile.downloadUrl);
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

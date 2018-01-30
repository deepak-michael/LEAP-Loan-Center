// Imports
import ContentEditController from './../contentEdit/contentEdit.controller';
import ContentViewController from './../contentView/contentView.controller';
import FolderController from './../folder/folder.controller';
import ImportController from './../import/import.controller';
import { profileData } from './../../core/auth/profile/profile.resolve';

/**
 * @ngInject
 */
export default class ContentController {
  /**
   * Constructor of the class.
   *
   * @param {Window} $window
   */
  constructor($window, FolderService, ContentService, $mdDialog, _profileData, UserService, ObjectService, LoggerService) {
    this.$window = $window;
    this.$mdDialog = $mdDialog;
    this.loggerService = LoggerService;

    this.selected = [];
    this.folderService = FolderService;
    this.objectService = ObjectService;
    this.contentService = ContentService;
    this.currentFolderName = "Root Folder";
    this.isLoanOfficer = false;
    this.currentFolder = {};
    this.rootFolder = {};

    this.folderService.fetchRootFolder().then( (item) => {
      this.rootFolder = item;
      this.showHomeFolder();
    });
    this.user = _profileData;
    this.roles = UserService.getRoles(false);
    this.loancontentlist = [];
    this.contentlist = [];

    //find out the acl id for approved loans
    this.objectService.fetchPermission('loanApproved').then(aclObject => {
        this.loanApprovalAcl = aclObject;
        this.objectService.fetchPermission('loanApplication').then(loanApplicationAcl => {
                this.loanApplicationAcl = loanApplicationAcl;
                //this.showLoans();
            }
        );
      }
    );


    var roles = this.roles;
    if (Array.isArray(roles) && roles.includes("loan_officer")) {
      this.isLoanOfficer = true;
    }
  }

  showHomeFolder() {
    this.showingLoanData = false;
    this.contentlist = [];
    this.folderService
      .fetchContent(this.rootFolder)
      .then((items) => {
        this.contentlist = items;
        this.setCurrentFolder(this.rootFolder);
      })
      .catch(() => {
        //this.reset();
      })
      .finally(() => {
        this.loading = false;
      })
    ;
  }

  showAllFolders() {
    this.contentlist = [];
    this.loading = true;
    this.showingLoanData = false;

    this.folderService
      .fetchContent()
      .then((items) => {
        //this.$state.go('auth.profile');
        this.contentlist = items;
        this.setCurrentFolder(null);
      })
      .catch(() => {
        //this.reset();
      })
      .finally(() => {
        this.loading = false;
      })
    ;
  }

  showItems(content) {
    if(content.type == 'file'){
        this.viewItem(content);
    }
    else{
      this.showFolderItems(content);
    }
  }

  showFolderItems(content){
      this.loading = true;
      this.showingLoanData = false;
      var user = this.user;
      if(this.roles.includes('loan_officer')) {
          user = {};
      }

      this.contentlist = [];
      this.folderService
          .fetchContent(content, user)
          .then((items) => {
              //this.$state.go('auth.profile');
              console.log("Current Folder"+content.name);
              this.contentlist = items;
              this.setCurrentFolder(content);
          })
          .catch(() => {
              //this.reset();
          })
          .finally(() => {
              this.loading = false;
          })
      ;
  }

  setCurrentFolder(content) {
    if(!content) {
      this.currentFolderName = "";
      return;
    }

    this.currentFolder = content;
    this.currentFolderName = this.currentFolder.name == "root" ? "Root Folder" : content.name;
  }

  showItemDialog(content, ev) {
    var me = this;
    this.$mdDialog.show({
      controller: ContentEditController,
      template: require('./../contentEdit/contentEdit.html'),
      locals: {
        content: content
      },
      parent: angular.element(document.body),
      targetEvent: ev,
      controllerAs: 'vm',
      clickOutsideToClose:true,
      resolve: {
        _profileData: profileData,
      }

    })
      .then(function(answer) {
        //me.loggerService.showToast("Document updated");
      }, function() {
        //$scope.status = 'You cancelled the dialog.';
      });
  }

  createFolder(content, ev) {
    var me = this;
    this.$mdDialog.show({
      controller: FolderController,
      template: require('./../folder/folderCreate.html'),
      locals: {
        folder: content,
        loanAclObject: this.loanApplicationAcl
      },
      parent: angular.element(document.body),
      targetEvent: ev,
      controllerAs: 'vm',
      clickOutsideToClose:true
    })
      .then(function(answer) {
        //$scope.status = 'You said the information was "' + answer + '".';
          me.showItems(content);
      }, function() {
        //$scope.status = 'You cancelled the dialog.';
      });
  }

  viewItem(content, ev) {
    this.$mdDialog.show({
      controller: ContentViewController,
      template: require('./../contentView/contentView.html'),
      locals: {
        content: content
      },
      parent: angular.element(document.body),
      targetEvent: ev,
      controllerAs: 'vm',
      clickOutsideToClose:true
    })
      .then(function(answer) {
        //$scope.status = 'You said the information was "' + answer + '".';
      }, function() {
        //$scope.status = 'You cancelled the dialog.';
      });

  }

  importDialog(folder, ev) {
    var me = this;
    this.$mdDialog.show({
      controller: ImportController,
      template: require('./../import/import.html'),
      locals: {
        folder: folder
      },
      parent: angular.element(document.body),
      targetEvent: ev,
      controllerAs: 'vm',
      clickOutsideToClose:true
    })
      .then(function(answer) {
        me.showItems(folder);
      }, function() {
        //$scope.status = 'You cancelled the dialog.';
      });
  }

  showLoans() {
    var user = this.user;
    var me = this;
    this.loancontentlist = [];
    if(this.roles.includes('loan_officer')) {
      user = {};
    }
    this.contentService.fetchLoanDocuments(user).then( (items) => {
      var itemsWithCanEdit = items.map(function (item) {
        item.userCanEdit = true;
        me.checkKnownAcl(item, me.loanApplicationAcl);
        me.checkKnownAcl(item, me.loanApprovalAcl);
        return item;
      });
      this.showingLoanData = true;
      this.loancontentlist = itemsWithCanEdit;
    })
  }

  checkKnownAcl(item: Object, acl: Object) {
    if(item.acl == acl.id) {
      item.userCanEdit = this.canUserEditDocument(acl);
    }
    return item;
  }

  canUserEditDocument(permission) {
    var documentAcl = permission;
    var userCanEditDocument = false;
    var applicableDocRoles = documentAcl.roles.filter(role => {
      return this.roles.includes(role.name);
    });

    var permitFound = applicableDocRoles.find(role => {
      return role.permits && role.permits.includes('write')
    });
    if (permitFound) {
      userCanEditDocument = true;
    }
    return userCanEditDocument;
  }

}

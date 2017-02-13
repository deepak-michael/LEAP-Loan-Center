/**
 * @ngInject
 */
export default class ProfileController {
  /**
   * Constructor of the class.
   *
   * @param {UserService} UserService
   * @param {Object}      _profileData
   */
  constructor(UserService, ObjectService, FolderService, _profileData: Object) {
    this.user = UserService.getProfile();
    this.objectService = ObjectService;
    this.folderService = FolderService;
    this.profile = _profileData;
    this.roles = UserService.getRoles(false);
    var profileController = this;

    //find out the acl id for applied loans
      this.objectService.fetchPermission('loanApplication').then(aclObject => {
          this.setupApp = false;
      }).catch (function (msg, code) {
          profileController.setupApp = true;

          //checking the user role
          if(profileController.roles.indexOf("application_admin") !== -1){
              profileController.appAdmin = true;
          }
          else{
              profileController.appAdmin = false;
          }
      });
  }

  createPermissions(permission){
      return this.objectService.createPermissions(permission).then( (data) => {
        return data;
      });
  }

  createTraitDefinitions(traitDef){
      return this.objectService.createTraitDefinitions(traitDef).then( (data) => {
        return data;
      });
  }

  createLoanFolder(folder){
      return this.folderService.createFolderAtRoot(folder).then( (data) => {
        return data;
      });
  }

    setupApplication() {
      var request = {
        "permissions":
      [
          {
              "name": "loanApplication",
              "description": "Loan Application",
              "owner": "app_admin",
              "roles": [
                  {
                      "name": "loan_applicant",
                      "permits": ["browse", "read", "version", "write","delete","comment"]
                  },
                  {
                      "name": "loan_officer",
                      "permits": ["browse", "read","comment", "print","annotate","change_location"]
                  }
              ]
          },
          {
              "name": "loanApproved",
              "description": "Loan Approved",
              "owner": "app_admin",
              "roles": [
                  {
                      "name": "loan_applicant",
                      "permits": ["browse", "read"]
                  },
                  {
                      "name": "loan_officer",
                      "permits": ["browse", "read","comment", "print","annotate","change_location"]
                  }
              ]
          }

      ],
          "traitDefinitions":
      [
          {
              "name": "loan",
              "displayName": "Loan",
              "attributes": [{
                  "name": "firstname",
                  "dataType": "string",
                  "size": 100,
                  "displayName": "First Name"
              },
                  {
                      "name": "lastname",
                      "dataType": "string",
                      "size": 100,
                      "displayName": "Last Name"
                  },
                  {
                      "name": "addressLine1",
                      "dataType": "string",
                      "displayName": "Address Line 1"
                  },
                  {
                      "name": "addressLine2",
                      "dataType": "string",
                      "displayName": "Address Line 2"
                  },
                  {
                      "name": "city",
                      "dataType": "string",
                      "displayName": "City"
                  },
                  {
                      "name": "state",
                      "dataType": "string",
                      "displayName": "State"
                  },
                  {
                      "name": "zipcode",
                      "dataType": "string",
                      "displayName": "Zip Code"
                  },
                  {
                      "name": "loanAmount",
                      "dataType": "double",
                      "repeating": "false",
                      "displayName": "Loan Amount"
                  },
                  {
                      "name": "loanTerm",
                      "dataType": "integer",
                      "displayName": "Loan Term"
                  }
              ]
          },
          {
              "name": "loanreviewstatus",
              "displayName": "Loan Review Status",
              "attributes": [{
                  "name": "reviewer",
                  "dataType": "string",
                  "size": 100,
                  "displayName": "Reviewer"
              },
                  {
                      "name": "isApproved",
                      "displayName": "Is approved",
                      "dataType": "boolean"
                  },
                  {
                      "name": "reviewDate",
                      "displayName": "Review Date",
                      "dataType": "date"
                  },
                  {
                      "name": "remarks",
                      "dataType": "string",
                      "size": 100,
                      "displayName": "Remarks"
                  }
              ]
          }
      ],
          "loansFolder" : {
              "name": "Loan requests",
              "description": "Loan requests",
              "parentFolder": "0"
          }
  };

      var promise = {permissions:[], traitDefinitions:[], loanFolder: {}};
      promise.permissions.push(this.createPermissions(request.permissions[0]));
      promise.permissions.push(this.createPermissions(request.permissions[1]));
      promise.traitDefinitions.push(this.createTraitDefinitions(request.traitDefinitions[0]));
      promise.traitDefinitions.push(this.createTraitDefinitions(request.traitDefinitions[1]));
      promise.loanFolder = this.createLoanFolder(request.loansFolder);

      Promise.all([
          promise.permissions[0],
          promise.permissions[1],
          promise.traitDefinitions[0],
          promise.traitDefinitions[1],
          promise.loanFolder
      ]).then(results => {
          this.setupApp = false;
    })
  }
}

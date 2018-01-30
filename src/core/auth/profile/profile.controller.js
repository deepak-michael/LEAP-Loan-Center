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
    this.tenant = UserService.getTenant();
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
                      "permits": ["browse", "read","write","delete","comment", "print","annotate","change_location"]
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
                      "permits": ["browse", "read","write","delete","comment", "print","annotate","change_location"]
                  }
              ]
          }

      ],
          "traitDefinitions":
      [
          {
              "name": "count",
              "attributes": [
                  {
                      "name": "loans",
                      "dataType": "integer"
                  },
                  {
                      "name": "totalAmount",
                      "dataType": "integer"
                  }
              ]
          },
          {
              "name": "loan",
              "attributes": [
                  {
                      "name": "buyer",
                      "dataType": "string",
                      "size": 100
                  },
                  {
                      "name": "loanAmount",
                      "dataType": "integer"
                  },
                  {
                      "name": "purchasePrice",
                      "dataType": "integer"
                  },
                  {
                      "name": "rate",
                      "dataType": "double"
                  },
                  {
                      "name": "type",
                      "dataType": "string",
                      "size": 100
                  }
              ],

              "script": [
                  "function validateLoanAmount() {",
                  "var loan = cms.newTrait;",
                  "if (loan.getProperty('loanAmount') > ( (80/100) * loan.getProperty('purchasePrice') ) ) {",
                  "cms.invalidInput('The loan amount cannot be greater than 80% of the purchase price');",
                  "}",
                  "}",

                  "function beforeAttachTrait() {",
                  "validateLoanAmount();",
                  "}",

                  "function afterUpdateTrait() {",
                  "validateLoanAmount();",
                  "}"
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
      promise.traitDefinitions.push(this.createTraitDefinitions(request.traitDefinitions[2]));
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

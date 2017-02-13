
export default class FolderController {
    constructor (folder, loanAclObject, FolderService, $mdDialog){
      this.parentFolder = folder;
      this.folderService = FolderService;
      this.dialog = $mdDialog;
      this.loanApplicationAcl = loanAclObject;
      this.newContentAcl = loanAclObject.id;


      this.newFolder = {
          name : '',
          description : '',
          type: 'folder',
          acl: this.newContentAcl
      }
    }

    cancel() {
      this.dialog.hide();
    }

    saveFolder() {
      //console.log(this.content);
      this.folderService.addItem(this.parentFolder, this.newFolder).then(item => {
          this.dialog.hide(true, item);
      });
    }
}

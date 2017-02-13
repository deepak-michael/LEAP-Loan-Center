
export default class ContentViewController {
    constructor (content, $mdDialog){
        this.newContent = content;
        this.loanTrait = content.traits && content.traits.loan ? content.traits.loan.loantrait : {};
        this.dialog = $mdDialog;    }

    closeDialog() {
        this.dialog.hide();
    }
}
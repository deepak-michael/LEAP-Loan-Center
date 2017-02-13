// Imports
import AboutItem from './../../entities/aboutItem';


/**
 * @ngInject
 */
export default class AboutController {
  /**
   * Constructor of the class.
   *
   * @param {Window} $window
   */
  constructor($window) {
    this.$window = $window;

    require('./img/barcelona-header.jpg');

    /**
     * List of AboutItem objects which is shown on about page
     *
     * @type {AboutItem[]}
     */
    this.items = [
      /*{
        title: 'Angular.js',
        image: require('./img/angularjs-logo.png'),
        url: 'https://angularjs.org/',
      },*/

    ].map(item => new AboutItem(item));
  }

  /**
   * Method to open selected item URL to new tab.
   *
   * @param {AboutItem} item
   */
  open(item: AboutItem) : void {
    this.$window.open(item.url, '_blank');
  }
}

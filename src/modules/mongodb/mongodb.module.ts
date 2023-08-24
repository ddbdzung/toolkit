export class ClassBuilderPattern {
  /**
   * @returns {Object} Plain object of class instance properties
   */
  public toPlainObject() {
    return Object.getOwnPropertyNames(this).reduce((obj, key) => {
      obj[key] = this[key];
      return obj;
    }, {});
  }
}



import * as Data from 'data/lib';



export type CartStatusOptions = "NEW" | "IN_PROCESS" | "ABANDONED" | "FULFILLED";
/**
* @interface ICart 
* Represents a cart data
 
* 
*/
interface ICart  {
    
    /**
    * @public
    * @attribute
    * Document identifier for later reference.
    * @type {string}
    * @memberof ICart
    */
    id: string;
    /**
    * @public
    * @attribute
    * Identifier of the store linked to the cart.
    * @type {string}
    * @memberof ICart
    */
    store: string;
    /**
    * @public
    * @attribute
    * Auditing information.
    * @type {Data.Audit}
    * @memberof ICart
    */
    
    audit?: Data.Audit;
    /**
    * @public
    * @attribute
    * Cart status in the process flow.
    * @type {CartStatusOptions}
    * @memberof ICart
    */
    status: CartStatusOptions;
}

export default ICart;
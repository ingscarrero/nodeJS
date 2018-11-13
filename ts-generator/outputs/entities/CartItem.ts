



/**
* @interface ICartItem 
* Represents a cart item data
 
* 
*/
interface ICartItem  {
    
    /**
    * @public
    * @attribute
    * Document identifier for later reference.
    * @type {string}
    * @memberof ICartItem
    */
    id: string;
    /**
    * @public
    * @attribute
    * Identifier of the cart linked to the item.
    * @type {string}
    * @memberof ICartItem
    */
    cart: string;
}

export default ICartItem;
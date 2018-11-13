

import * as Entities from '../entities'; 


/**
* @class CartItem 
* Represents a cart item data
* @implements ICartItem
 
* 
*/
class CartItem implements Entities.ICartItem  {
    
    
    id: string;
    
    cart: string;
}

export default CartItem;
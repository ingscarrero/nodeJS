

import * as Data from 'data/lib';
import * as Entities from '../entities'; 
import { CartStatusOptions } from '../entities';

/**
* @class Cart 
* Represents a cart data
* @implements ICart
 
* 
*/
class Cart implements Entities.ICart  {
    
    
    id: string;
    
    store: string;
    
    
    audit?: Data.Audit;
    
    status: CartStatusOptions;
}

export default Cart;
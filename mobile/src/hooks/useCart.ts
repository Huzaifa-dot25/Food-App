import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchCart, addCartItem, updateCartItem, removeCartItem,
  applyCartCoupon, removeCartCoupon, clearCartThunk,
  selectCart, selectCartCount, selectCartTotal, selectCartLoading,
} from '@/store/slices/cartSlice';

export function useCart() {
  const dispatch = useAppDispatch();

  return {
    cart:     useAppSelector(selectCart),
    count:    useAppSelector(selectCartCount),
    total:    useAppSelector(selectCartTotal),
    isLoading:useAppSelector(selectCartLoading),
    fetch:    ()                                              => dispatch(fetchCart()),
    addItem:  (foodId: number, quantity = 1)                  => dispatch(addCartItem({ foodId, quantity })),
    updateItem: (itemId: number, quantity: number)            => dispatch(updateCartItem({ itemId, quantity })),
    removeItem: (itemId: number)                              => dispatch(removeCartItem(itemId)),
    applyCoupon:(code: string)                                => dispatch(applyCartCoupon(code)),
    removeCoupon:()                                           => dispatch(removeCartCoupon()),
    clear:    ()                                              => dispatch(clearCartThunk()),
  };
}

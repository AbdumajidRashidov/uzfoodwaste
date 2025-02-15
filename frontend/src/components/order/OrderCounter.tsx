import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import {svg} from '../../assets/svg';
import {ProductType} from '../../types';
import {useAppDispatch} from '../../hooks';
import {quantityInCart} from '../../utils';
// import InCart from '../InCart';
import {showMessage} from '../../utils';
// import {ProductInCart} from '../../components/product/ProductInCart';
import DishInCart from '../product/ProductInCart';
import {addToCart, removeFromCart} from '../../store/slices/cartSlice';

type Props = {
  item: ProductType;
};

import OrderItemBtn from './OrderItemBtn';
import {theme} from '../../constants';

const OrderCounter: React.FC<Props> = ({item}): JSX.Element => {
  const dispatch = useAppDispatch();
  const quantity = quantityInCart(item);
  return (
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <TouchableOpacity
        style={{
          padding: 14,
        }}
        onPress={() => {
          dispatch(addToCart(item));
        }}
      >
        <svg.PlusSvg />
      </TouchableOpacity>
      <Text
        style={{
          ...theme.fonts.DMSans_400Regular,
          fontSize: 12,
          color: theme.colors.textColor,
        }}
      >
        {quantity}
      </Text>
      <TouchableOpacity
        style={{
          padding: 14,
        }}
        onPress={() => {
          dispatch(removeFromCart(item));
        }}
      >
        <svg.MinusSvg />
      </TouchableOpacity>
    </View>
  );
};

export default OrderCounter;

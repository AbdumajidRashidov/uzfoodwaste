import React, {PropsWithChildren} from 'react';
import {TouchableOpacity, Alert} from 'react-native';
import {useAppSelector, useAppDispatch} from '../../hooks';
import {
  addToWishlist,
  removeFromWishlist,
} from '../../store/slices/wishlistSlice';
import {ProductType} from '../../types';
import {theme} from '../../constants';
import {svg} from '../../assets/svg';

type Props = PropsWithChildren<{
  version?: number;
  item: ProductType;
  containerStyle?: object;
}>;

const ProductInWishlist: React.FC<Props> = ({
  containerStyle,
  item,
  version = 1,
}): JSX.Element | null => {
  const dispatch = useAppDispatch();

  const wishlist = useAppSelector((state) => state.wishlistSlice.list);
  const itemExist = (item: ProductType) =>
    wishlist.find((i) => i.id === item.id);

  const fillColor = itemExist(item) ? '#FA5555' : theme.colors.transparent;
  const strokeColor = itemExist(item) ? '#FA5555' : theme.colors.textColor;

  const itemExistMessage = () => {
    return Alert.alert(
      'Product already in wishlist',
      'Are you sure you want to delete from wishlist ?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => dispatch(removeFromWishlist(item)),
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={() => {
        if (itemExist(item)) {
          itemExistMessage();
        }
        if (!itemExist(item)) {
          dispatch(addToWishlist(item));
        }
      }}
    >
      {version === 1 && (
        <svg.HeartSvg fillColor={fillColor} strokeColor={strokeColor} />
      )}
      {version === 2 && (
        <svg.HeartBigSvg fillColor={fillColor} strokeColor={strokeColor} />
      )}
    </TouchableOpacity>
  );
};

export default ProductInWishlist;

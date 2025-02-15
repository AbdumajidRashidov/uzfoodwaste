import {View, Text, TouchableOpacity} from 'react-native';
import React, {PropsWithChildren} from 'react';

import Image from '../custom/Image';
import {theme} from '../../constants';
import {ProductType} from '../../types';
import {useAppNavigation} from '../../hooks';
import ProductNew from '../product/ProductNew';
import ProductName from '../product/ProductName';
import ProductPrice from '../product/ProductPrice';

type Props = PropsWithChildren<{
  item: ProductType;
  lastItem?: boolean;
}>;

const MenuListItem: React.FC<Props> = ({item, lastItem}): JSX.Element => {
  const navigation = useAppNavigation();
  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.white,
        borderRadius: 10,
        marginBottom: lastItem ? 0 : 14,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={() => navigation.navigate('Product', {item})}
    >
      <Image
        source={{uri: item.image}}
        style={{
          width: 117,
          height: 117,
          margin: 8,
        }}
        imageStyle={{borderRadius: 10}}
      />
      <ProductNew
        item={item}
        containerStyle={{
          position: 'absolute',
          top: 0,
          padding: 7,
        }}
      />
      <View style={{flex: 1, marginRight: 17, marginLeft: 4}}>
        <ProductName item={item} style={{marginBottom: 4}} />
        <Text
          numberOfLines={2}
          style={{
            ...theme.fonts.DMSans_400Regular,
            fontSize: 10,
            color: theme.colors.textColor,
            marginBottom: 4,
            lineHeight: 10 * 1.5,
          }}
        >
          {item.description}
        </Text>
        <Text
          style={{
            ...theme.fonts.DMSans_400Regular,
            fontSize: 10,
            color: theme.colors.textColor,
            marginBottom: 6,
            lineHeight: 10 * 1.5,
          }}
        >
          {item.weight} - {item.calories}
        </Text>
        <ProductPrice item={item} />
      </View>
    </TouchableOpacity>
  );
};

export default MenuListItem;

import {View, Text, ViewStyle} from 'react-native';
import React, {PropsWithChildren} from 'react';

import {svg} from '../../assets/svg';

import {ProductType} from '../../types';

type Props = PropsWithChildren<{
  containerStyle?: ViewStyle;
  item?: ProductType;
  version?: number;
}>;

const ProductNew: React.FC<Props> = ({
  containerStyle,
  item,
  version = 1,
}): JSX.Element | null => {
  if (item?.is_new) {
    return (
      <View style={{...containerStyle}}>
        {version === 1 && <svg.NewSvg />}
        {version === 2 && <svg.NewBigSvg />}
      </View>
    );
  }

  return null;
};

export default ProductNew;

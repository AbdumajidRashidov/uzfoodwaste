import {TouchableOpacity} from 'react-native';
import React from 'react';

type Props = {
  plus?: boolean;
  minus?: boolean;
  onPress: () => void;
  containerStyle?: object;
};
import {svg} from '../../assets/svg';

const OrderItemBtn: React.FC<Props> = ({
  onPress,
  plus,
  minus,
  containerStyle,
}): JSX.Element => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {plus && <svg.PlusSvg />}
      {/* {minus && <svg.MinusSvg />} */}
    </TouchableOpacity>
  );
};

export default OrderItemBtn;
